import { useEffect, useState } from "react";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import {
  clearOpenAIApiKey,
  hasStoredOpenAIApiKey,
  loadOpenAIApiKey,
  saveOpenAIApiKey,
} from "../../storage/apiKeyStorage";

export function OpenAIApiKeySettings() {
  const [apiKey, setApiKey] = useState("");
  const [hasStoredKey, setHasStoredKey] = useState(hasStoredOpenAIApiKey);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    loadOpenAIApiKey().then((storedKey) => {
      if (active) setHasStoredKey(Boolean(storedKey));
    });
    return () => {
      active = false;
    };
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      await saveOpenAIApiKey(apiKey);
      setApiKey("");
      setHasStoredKey(true);
      setMessage("API key 已加密儲存在這個瀏覽器。");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    setBusy(true);
    try {
      await clearOpenAIApiKey();
      setApiKey("");
      setHasStoredKey(false);
      setMessage("已清除這個瀏覽器中的 API key 與解密 key。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={2} mt={4} pt={3} borderTop={1} borderColor="divider">
      <div>
        <Typography variant="overline">OPENAI · PERSONAL KEY</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          解析上傳檔案時，會用你自己的 OpenAI API key 從此瀏覽器直接呼叫
          gpt-5.6-sol。
        </Typography>
      </div>
      <Alert severity="warning" variant="outlined">
        API key 會以 AES-GCM 加密後保存在此瀏覽器；解密 key 留在 IndexedDB。
        這能避免直接讀取 localStorage 看到明文，但無法防止同源惡意程式；請使用受限的
        Project key 並設定用量上限。
      </Alert>
      <TextField
        label="OpenAI API key"
        name="openai-api-key"
        type="password"
        value={apiKey}
        onChange={(event) => {
          setApiKey(event.target.value);
          setMessage("");
        }}
        placeholder={hasStoredKey ? "已儲存；輸入新 key 可覆蓋" : "sk-…"}
        autoComplete="off"
        fullWidth
        helperText={
          <>
            尚未有 key？前往{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noreferrer"
            >
              OpenAI API Keys
            </a>
            。
          </>
        }
      />
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          onClick={save}
          disabled={busy || !apiKey.trim()}
        >
          {hasStoredKey ? "更新 key" : "儲存 key"}
        </Button>
        <Button color="error" onClick={clear} disabled={busy || !hasStoredKey}>
          清除 key
        </Button>
      </Stack>
      <Typography
        variant="caption"
        color={hasStoredKey ? "success.main" : "text.secondary"}
      >
        {hasStoredKey ? "已設定個人 API key" : "尚未設定 API key"}
      </Typography>
      <Typography variant="caption" role="status" aria-live="polite">
        {message}
      </Typography>
    </Stack>
  );
}
