import { Alert, Box, Button, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import { Directions } from "@mui/icons-material";
import { minutesUntilTrip, selectNextConfirmedEvent, selectRuntimeCandidates } from "../../domain/trip/runtime";
import { DayView } from "./DayView";
import { EventIcon, mapHref } from "./EventPresentation";
import { useViewerData } from "./viewerContext";

export function TripStatusView({ runtime }) {
  const { canonicalTrip, trip, days } = useViewerData();
  if (runtime.phase === "after") return (
    <Paper sx={{ borderTop: 1, borderBottom: 1, borderColor: "text.primary", p: { xs: 4, md: 7 }, textAlign: "center" }}>
      <Typography variant="overline" color="secondary">TRIP COMPLETED</Typography>
      <Typography variant="h1" fontSize={{ xs: 38, md: 56 }} mt={2}>{trip.title}</Typography>
      <Typography color="text.secondary" mt={2}>旅程已結束，完整行程仍可從 Day 查看。</Typography>
    </Paper>
  );
  const daysToGo = minutesUntilTrip(canonicalTrip, runtime);
  const nextCandidate = selectNextConfirmedEvent(canonicalTrip, runtime);
  const nextDay = nextCandidate ? days.find((day) => day.date === nextCandidate.date) : null;
  const nextEvent = nextDay?.events.find((event) => event.id === nextCandidate?.event.id);
  return (
    <Paper sx={{ borderTop: 1, borderBottom: 1, borderColor: "text.primary", p: { xs: 3, md: 5 } }}>
      <Typography variant="overline" color="secondary">UP NEXT</Typography>
      <Typography variant="h1" fontSize={{ xs: 38, md: 56 }} mt={1}>{daysToGo} days to go</Typography>
      <Typography color="text.secondary" mt={1}>目前 {canonicalTrip.timezone} 日期：{runtime.date}</Typography>
      {nextEvent && <><Divider sx={{ my: 3 }} /><Stack direction="row" spacing={2} alignItems="center"><EventIcon type={nextEvent.type} /><Box><Typography variant="h3" fontSize={20}>{nextEvent.title} · {nextDay.month} {nextDay.n}</Typography><Typography color="text.secondary" variant="body2">{[nextEvent.time, nextEvent.meta].filter(Boolean).join(" · ")}</Typography></Box></Stack></>}
    </Paper>
  );
}

export function RuntimeUnavailableView() {
  return <Alert severity="warning" role="status">即時時間狀態目前無法取得，因此不顯示 NOW、NEXT、倒數或建議離開時間。Overview 與每一天的靜態行程仍可正常查看。</Alert>;
}

export function TodayView({ day, onFullDay, runtime }) {
  const { canonicalTrip } = useViewerData();
  const runtimeSelection = selectRuntimeCandidates(day.canonicalDay, runtime.minutes);
  const current = day.events.find((event) => event.id === runtimeSelection.current?.id);
  const next = day.events.find((event) => event.id === runtimeSelection.next?.id);
  if (!current && !next) return <><Typography variant="overline" color="secondary">TODAY · {String(Math.floor(runtime.minutes / 60)).padStart(2, "0")}:{String(runtime.minutes % 60).padStart(2, "0")} · {canonicalTrip.timezone}</Typography><Typography color="text.secondary" variant="body2" mt={1} mb={4}>此日沒有足夠精確的時間資料，因此不顯示推測的 NOW。</Typography><DayView day={day} /></>;
  return (
    <>
      <Typography variant="overline" color="secondary">TODAY · {day.dow} · {day.month} {day.n}</Typography>
      <Typography variant="h1" fontSize={{ xs: 38, md: 56 }} mt={1}>{day.title}</Typography>
      <Typography color="text.secondary" mt={1}>{day.subtitle}</Typography>
      <Paper sx={{ mt: 5, p: { xs: 2.5, md: 4 }, borderTop: 1, borderBottom: 1, borderColor: "text.primary" }}>
        <Typography variant="overline" color="secondary">{current ? "NOW" : "TODAY"}</Typography>
        <Stack direction="row" spacing={2} mt={1.5}><EventIcon type={current?.type || "transport"} /><Box><Typography variant="h2" fontSize={25}>{current?.title || `${day.title}自由行程`}</Typography><Typography color="text.secondary" variant="body2" mt={0.5}>{current?.meta || "時間彈性，因此不推測目前所在的景點。"}</Typography>{current?.note && <Typography mt={2} fontFamily='"Noto Serif TC",serif' fontWeight={700}>「{current.note}」</Typography>}</Box></Stack>
        {next && <><Divider sx={{ my: 3, borderStyle: "dashed" }} /><Typography variant="overline" color="secondary">NEXT</Typography><Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={1.5} alignItems={{ sm: "center" }}><Typography fontFamily="ui-monospace" fontWeight={700}>{next.time}</Typography><Box flex={1}><Typography variant="h3" fontSize={20}>{next.title}</Typography><Typography variant="body2" color="text.secondary">{next.meta}</Typography>{next.status && <Chip size="small" color="success" label={`✓ ${next.status}`} sx={{ mt: 1 }} />}</Box>{day.suggestedDeparture && <Paper sx={{ p: 1.5, bgcolor: "text.primary", color: "white", textAlign: "right" }}><Typography variant="overline" fontSize={9}>SUGGESTED DEPARTURE</Typography><Typography color="var(--trip-color-acid)" fontFamily="ui-monospace" fontWeight={700}>{day.suggestedDeparture}</Typography></Paper>}</Stack></>}
        <Stack direction="row" spacing={1} mt={3}>{next?.map && <Button variant="contained" startIcon={<Directions />} href={mapHref(next.map)} target="_blank" rel="noreferrer">{next.mapIsFallback ? "Search Maps · unresolved" : "Directions"}</Button>}<Button onClick={onFullDay}>View full day</Button></Stack>
      </Paper>
    </>
  );
}
