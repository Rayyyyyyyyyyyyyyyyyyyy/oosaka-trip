import React, { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Drawer, IconButton, List, ListItemButton, Stack, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";
import { clearLocalTripData } from "../../storage/tripStorage";
import { CanonicalTripControls } from "../trip-import/CanonicalTripControls";

const TripImportWorkflow = React.lazy(() => import("../trip-import/TripImportWorkflow").then((module) => ({ default: module.TripImportWorkflow })));

export function TripMenu({ open, onClose, onSelectView, canonicalTrip, importWorkflow, onTripImported, onTripCleared, onExitSample, sampleMode }) {
  const [importLoaded, setImportLoaded] = useState(false);
  const [clearDialog, setClearDialog] = useState(false);
  useEffect(() => { if (open) setImportLoaded(true); }, [open]);
  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose}>
        <Box width={{ xs: 300, sm: 380 }} p={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="overline">TRIP MENU</Typography><IconButton onClick={onClose} aria-label="關閉選單"><Close /></IconButton></Stack>
          <List sx={{ mt: 3 }}>{[["overview", "Trip Overview"], ["today", "Today / Now"], ["reservations", "Reservations"]].map(([view, label]) => <ListItemButton key={view} onClick={() => { onSelectView(view); onClose(); }} sx={{ borderTop: 1, borderColor: "divider" }}>{label}</ListItemButton>)}</List>
          <Typography color="text.secondary" mt={8} fontFamily='"Noto Serif TC",serif'>不要把旅行排成 KPI。<br />保留臨時起意的空間。</Typography>
          <CanonicalTripControls trip={canonicalTrip} onTripImported={onTripImported} />
          {importLoaded && <React.Suspense fallback={<Typography role="status">正在載入匯入工具…</Typography>}><TripImportWorkflow workflow={importWorkflow} /></React.Suspense>}
          <Button color="error" variant="outlined" sx={{ mt: 4 }} onClick={() => setClearDialog(true)}>{sampleMode ? "離開大阪範例" : "清除這趟本機旅程"}</Button>
        </Box>
      </Drawer>
      <Dialog open={clearDialog} onClose={() => setClearDialog(false)}><DialogTitle>{sampleMode ? "離開大阪範例？" : "清除這趟本機旅程？"}</DialogTitle><DialogContent>{sampleMode ? "範例不會儲存成你的已確認旅程；離開後會回到 Home。" : "這會移除已匯入的旅程與 checklist 狀態並回到 Home。個人 AI provider key 會保留，需另行明確清除。"}</DialogContent><DialogActions><Button onClick={() => setClearDialog(false)}>取消</Button><Button color="error" onClick={() => { setClearDialog(false); if (sampleMode) onExitSample?.(); else { clearLocalTripData(); onTripCleared?.(); } }}>{sampleMode ? "確認離開" : "確認清除"}</Button></DialogActions></Dialog>
    </>
  );
}
