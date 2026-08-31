import { lazy, Suspense, useReducer } from "react";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { Explore } from "@mui/icons-material";
import { CanonicalTripControls } from "./CanonicalTripControls";
import { importReducer, initialImportState } from "./importReducer";

const TripImportWorkflow = lazy(() => import("./TripImportWorkflow").then((module) => ({ default: module.TripImportWorkflow })));

export function TripHome({ onOpenSample }) {
  const [state, dispatch] = useReducer(importReducer, initialImportState);

  return (
    <Box minHeight="100vh" bgcolor="background.default" py={{ xs: 5, md: 9 }}>
      <Container maxWidth="sm">
        <Typography variant="overline" color="secondary">TRIP RUNTIME</Typography>
        <Typography variant="h1" fontSize={{ xs: 42, md: 60 }} mt={1}>
          把你的行程帶進來
        </Typography>
        <Typography color="text.secondary" mt={2}>
          上傳一個 Markdown，經過來源保留、保守解析與 Review 後，才會取代目前確認的旅程。
        </Typography>

        <Paper sx={{ mt: 4, p: { xs: 2.5, md: 4 }, borderTop: 1, borderBottom: 1, borderColor: "text.primary" }}>
          <Suspense fallback={<Typography role="status">正在載入匯入工具…</Typography>}>
            <TripImportWorkflow state={state} dispatch={dispatch} />
          </Suspense>
          <CanonicalTripControls trip={null} />
        </Paper>

        <Paper variant="outlined" sx={{ mt: 3, p: 2.5 }}>
          <Typography variant="overline">OPTIONAL DETAILS</Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            預留給未來經過驗證的選填欄位；目前不要求旅客先填任何額外資料。
          </Typography>
        </Paper>

        <Stack mt={3} alignItems="flex-start">
          <Button startIcon={<Explore />} onClick={onOpenSample}>
            查看大阪內建範例
          </Button>
          <Typography variant="caption" color="text.secondary">
            範例只在你主動開啟時顯示，不會被視為已匯入旅程。
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
