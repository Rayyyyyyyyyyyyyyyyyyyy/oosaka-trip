import { parsedTripDraftSchema, unifiedSourceDocumentSchema } from "../domain/trip/reviewSchema";
import { loadOpenAIApiKey } from "../storage/apiKeyStorage";
import { createParserRequestBody } from "./parserContract";

export const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
export const OPENAI_REQUEST_TIMEOUT_MS = 45_000;
export const PARSE_DEADLINE_MS = 55_000;
export const MAX_REQUEST_BYTES = 6 * 1024 * 1024;

export class ParseTripError extends Error {
  constructor(code, message, options) {
    super(message, options);
    this.name = "ParseTripError";
    this.code = code;
  }
}

function messageForStatus(status) {
  if (status === 401 || status === 403) return ["provider_auth", "OpenAI 拒絕此 API key；請確認 key 與 Project 權限。"];
  if (status === 429) return ["provider_rate_limit", "OpenAI 目前達到用量或速率限制，請稍後重試。"];
  if (status >= 500) return ["provider_unavailable", "OpenAI 暫時無法完成解析，請稍後重試。"];
  return ["provider_failure", `OpenAI 解析失敗（HTTP ${status}）。`];
}

function outputText(response) {
  if (typeof response.output_text === "string") return response.output_text;
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "refusal") {
        throw new ParseTripError("provider_refusal", "OpenAI 無法解析這份來源；原檔未被保存。" );
      }
      if (content.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  throw new ParseTripError("malformed_output", "OpenAI 回傳缺少結構化結果，請安全重試。" );
}

function createAttemptSignal(externalSignal, timeoutMs) {
  const controller = new AbortController();
  const abortFromExternal = () => controller.abort(externalSignal?.reason);
  if (externalSignal?.aborted) abortFromExternal();
  else externalSignal?.addEventListener("abort", abortFromExternal, { once: true });
  const timer = setTimeout(() => controller.abort(new DOMException("Timed out", "TimeoutError")), timeoutMs);
  return {
    signal: controller.signal,
    cleanup() {
      clearTimeout(timer);
      externalSignal?.removeEventListener("abort", abortFromExternal);
    },
  };
}

function parseProviderJson(response) {
  let decoded;
  try {
    decoded = JSON.parse(outputText(response));
  } catch (error) {
    if (error instanceof ParseTripError) throw error;
    throw new ParseTripError("malformed_output", "OpenAI 回傳的結構化結果無法讀取，請安全重試。", { cause: error });
  }
  const result = parsedTripDraftSchema.safeParse(decoded);
  if (!result.success) {
    throw new ParseTripError("schema_mismatch", "OpenAI 回傳的行程結構未通過安全驗證，請重試或返回上傳。" );
  }
  return result.data;
}

/**
 * Browser-only parsing boundary. Source, request, response, and key remain in memory.
 * @param {{sourceDocument: import('../domain/trip/reviewSchema').UnifiedSourceDocument, signal?: AbortSignal, apiKey?: string, fetchImpl?: typeof fetch, now?: () => number, retryDelay?: (ms: number) => Promise<void>}} request
 */
export async function parseTrip(request) {
  const sourceDocument = unifiedSourceDocumentSchema.parse(request.sourceDocument);
  const apiKey = request.apiKey?.trim() || await loadOpenAIApiKey();
  if (!apiKey) {
    throw new ParseTripError("missing_key", "請先在此瀏覽器儲存個人 OpenAI API key。" );
  }

  const fetchImpl = request.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") throw new ParseTripError("network_unavailable", "此瀏覽器無法送出解析請求。" );
  const body = JSON.stringify(createParserRequestBody(sourceDocument));
  if (new TextEncoder().encode(body).byteLength > MAX_REQUEST_BYTES) {
    throw new ParseTripError("request_too_large", "抽取後內容超過 V0 單次解析上限（6 MiB）。" );
  }

  const now = request.now ?? Date.now;
  const retryDelay = request.retryDelay ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const deadline = now() + PARSE_DEADLINE_MS;
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (request.signal?.aborted) throw new ParseTripError("cancelled", "已取消這次解析。" );
    const remaining = deadline - now();
    if (remaining <= 0) throw new ParseTripError("timeout", "解析超過 55 秒期限，請重試。" );
    const attemptSignal = createAttemptSignal(request.signal, Math.min(OPENAI_REQUEST_TIMEOUT_MS, remaining));
    try {
      const response = await fetchImpl(OPENAI_RESPONSES_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body,
        signal: attemptSignal.signal,
      });
      if (!response.ok) {
        const [code, message] = messageForStatus(response.status);
        const error = new ParseTripError(code, message);
        error.retryable = response.status === 429 || response.status >= 500;
        throw error;
      }
      const providerResponse = await response.json();
      const draft = parseProviderJson(providerResponse);
      return {
        draft,
        metrics: {
          inputTokens: providerResponse.usage?.input_tokens ?? null,
          outputTokens: providerResponse.usage?.output_tokens ?? null,
          totalTokens: providerResponse.usage?.total_tokens ?? null,
          attempts: attempt + 1,
        },
      };
    } catch (error) {
      if (request.signal?.aborted) throw new ParseTripError("cancelled", "已取消這次解析。" );
      if (error?.name === "AbortError" || error?.name === "TimeoutError" || attemptSignal.signal.aborted) {
        lastError = new ParseTripError("timeout", "OpenAI 解析逾時，請重試。", { cause: error });
        lastError.retryable = true;
      } else if (error instanceof ParseTripError) {
        lastError = error;
      } else {
        lastError = new ParseTripError("network_failure", "無法連線到 OpenAI；請檢查網路後重試。", { cause: error });
        lastError.retryable = false;
      }
    } finally {
      attemptSignal.cleanup();
    }

    if (attempt === 0 && lastError.retryable && deadline - now() > 250) {
      await retryDelay(Math.min(250 + Math.floor(Math.random() * 250), Math.max(0, deadline - now())));
      continue;
    }
    throw lastError;
  }
  throw lastError;
}
