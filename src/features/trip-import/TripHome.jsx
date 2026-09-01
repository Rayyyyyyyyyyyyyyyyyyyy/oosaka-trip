import { lazy, Suspense } from "react";
import { Alert, Button, Paper, Typography } from "@mui/material";
import { Explore } from "@mui/icons-material";
import { CanonicalTripControls } from "./CanonicalTripControls";
import { useTripImportWorkflow } from "./useTripImportWorkflow";

const TripImportWorkflow = lazy(() =>
  import("./TripImportWorkflow").then((module) => ({
    default: module.TripImportWorkflow,
  })),
);

export function TripHome({
  onOpenSample,
  onTripConfirmed,
  onTripImported,
  recoveryStatus = null,
}) {
  const workflow = useTripImportWorkflow({ onTripConfirmed });

  return (
    <div className="min-h-screen bg-trip-paper py-10 text-trip-ink md:py-[72px]">
      <main className="mx-auto w-full max-w-[600px] px-4 sm:px-6">
        <Typography variant="overline" color="secondary">
          TRIP RUNTIME
        </Typography>
        <Typography variant="h1" className="!mt-2 !text-[42px] md:!text-6xl">
          把你的行程帶進來
        </Typography>
        <Typography color="text.secondary" className="!mt-4">
          上傳一個 Markdown，經過來源保留、保守解析與 Review
          後，才會取代目前確認的旅程。
        </Typography>

        {recoveryStatus && (
          <Alert severity="warning" className="!mt-6">
            {recoveryStatus === "invalid"
              ? "已儲存的旅程目前無法開啟。它不會進入 Viewer，也尚未被自動刪除；你可以在下方重新匯入有效資料或查看大阪範例。"
              : "瀏覽器目前無法讀取已儲存的旅程。你仍可使用下方匯入工具或查看大阪範例。"}
          </Alert>
        )}

        <Paper className="!mt-8 border-y !border-trip-ink !p-5 md:!p-8">
          <Suspense
            fallback={<Typography role="status">正在載入匯入工具…</Typography>}
          >
            <TripImportWorkflow workflow={workflow} />
          </Suspense>
          <CanonicalTripControls trip={null} onTripImported={onTripImported} />
        </Paper>

        <Paper variant="outlined" className="!mt-6 !p-5">
          <Typography variant="overline">OPTIONAL DETAILS</Typography>
          <Typography variant="body2" color="text.secondary" className="!mt-2">
            預留給未來經過驗證的選填欄位；目前不要求旅客先填任何額外資料。
          </Typography>
        </Paper>

        <div className="mt-6 flex flex-col items-start">
          <Button startIcon={<Explore />} onClick={onOpenSample}>
            查看大阪內建範例
          </Button>
          <Typography variant="caption" color="text.secondary">
            範例只在你主動開啟時顯示，不會被視為已匯入旅程。
          </Typography>
        </div>
      </main>
    </div>
  );
}
