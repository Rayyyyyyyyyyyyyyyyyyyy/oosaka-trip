import { useEffect, useRef, useState } from "react";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import { Description } from "@mui/icons-material";
import { extractMarkdownFile, validateMarkdownFile } from "./markdownAdapter";

const labels = {
  validating: "正在驗證 Markdown…",
  extracting: "正在保留 Markdown 結構…",
  parsing: "正在透過你的個人 OpenAI key 安全解析…",
};

export function MarkdownImportControls({ state, dispatch, onExtracted, onRetry, onCancel }) {
  const messageRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (state.error) messageRef.current?.focus();
  }, [state.error]);

  const processFile = async (file) => {
    if (!file) return;
    const requestId = crypto.randomUUID();
    dispatch({ type: "SELECT_FILE", requestId, file });
    try {
      validateMarkdownFile(file);
      dispatch({ type: "VALIDATED", requestId });
      const sourceDocument = await extractMarkdownFile(file);
      dispatch({ type: "EXTRACTED", requestId, sourceDocument });
      onExtracted?.(sourceDocument, requestId);
    } catch (error) {
      dispatch({ type: "FAIL", requestId, recoverTo: state.tripId ? "viewing" : "idle", error: error.message });
    }
  };

  const chooseFile = (event) => {
    const [file] = event.target.files || [];
    event.target.value = "";
    void processFile(file);
  };

  const dropFile = (event) => {
    event.preventDefault();
    setDragActive(false);
    const [file] = event.dataTransfer.files || [];
    void processFile(file);
  };

  return (
    <Stack spacing={1.5} mt={4} pt={3} borderTop={1} borderColor="divider">
      <Typography variant="overline">MARKDOWN V0</Typography>
      <Typography variant="caption" color="text.secondary">
        一次處理一個 .md。XLSX 會在 Hosted Delivery 之後以窄版 Travel Table change 支援，其他格式仍待證據驗證。
      </Typography>
      <Alert severity="info" variant="outlined" role="note">
        你的檔案會由此瀏覽器使用個人 API key 直接送到 OpenAI。Trip Runtime 不保存來源或模型回覆；未完成 Review 只存在此分頁，重新整理或關閉就會丟棄。
      </Alert>
      <Paper
        variant="outlined"
        onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragActive(false)}
        onDrop={dropFile}
        sx={{ p: 2, textAlign: "center", borderStyle: "dashed", bgcolor: dragActive ? "action.hover" : "transparent" }}
      >
        <Typography variant="body2" mb={1}>拖放一個 Markdown 檔案到這裡，或</Typography>
        <Button component="label" variant="contained" startIcon={<Description />}>
          選擇 Markdown
          <input aria-label="選擇 Markdown 檔案" hidden type="file" accept="text/markdown,.md" onChange={chooseFile} />
        </Button>
      </Paper>
      {labels[state.status] && <Typography role="status" aria-live="polite">{labels[state.status]}</Typography>}
      {state.error && <Alert ref={messageRef} tabIndex={-1} role="alert" severity="error">{state.error}</Alert>}
      {state.status === "parse_error" && (
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={onRetry}>重試解析</Button>
          <Button onClick={() => dispatch({ type: "RETURN_TO_IDLE" })}>返回上傳</Button>
        </Stack>
      )}
      {state.status === "parsing" && <Button onClick={onCancel}>取消解析</Button>}
    </Stack>
  );
}
