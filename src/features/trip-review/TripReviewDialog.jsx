import { useEffect, useMemo, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Add, Delete, ExpandMore } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { addReviewItem, applyReviewOverride, removeReviewItem } from "../../domain/trip/review";
import { ReferenceBlocksReview, sourceBlockContent } from "./ReferenceBlocksReview";
import { ReviewFindingsSummary } from "./ReviewFindingsSummary";

const EVENT_TYPES = ["flight", "hotel", "work", "activity", "restaurant", "free_time", "transport"];
const TIMING_KINDS = ["exact", "range", "open_ended", "approximate", "part_of_day", "all_day", "unspecified"];

function messagesFor(findings, entityId) {
  return findings.filter((finding) => finding.entityId === entityId);
}

function Field({ label, value, onChange, type, error, ...props }) {
  return <TextField label={label} value={value ?? ""} onChange={(event) => onChange(event.target.value || null)} type={type} error={Boolean(error)} helperText={error?.message} fullWidth {...props} />;
}

function Evidence({ entries, sourceDocument, travelerOverride = false }) {
  if (!entries?.length) return (
    <Typography variant="caption" color={travelerOverride ? "info.main" : "warning.main"}>
      {travelerOverride ? "旅客人工新增；未建立或捏造來源證據。" : "沒有可驗證的來源證據；請人工確認。"}
    </Typography>
  );
  return (
    <Box component="details">
      <Typography component="summary" variant="caption" sx={{ cursor: "pointer" }}>查看來源證據</Typography>
      <Stack spacing={1} mt={1}>
        {entries.map((entry, index) => {
          const block = sourceDocument.blocks.find((candidate) => candidate.id === entry.blockId);
          return block ? (
            <Typography key={`${entry.blockId}-${index}`} variant="caption" color="text.secondary">
              Lines {block.locator.startLine}–{block.locator.endLine}: 「{sourceBlockContent(block)}」
            </Typography>
          ) : (
            <Typography key={`${entry.blockId}-${index}`} variant="caption" color="warning.main">
              找不到來源區塊 {entry.blockId}；provider excerpt 不視為已驗證證據。
            </Typography>
          );
        })}
      </Stack>
    </Box>
  );
}

function timingFor(kind, current) {
  const label = current?.label || (kind === "all_day" ? "全天" : kind === "unspecified" ? "時間未指定" : kind);
  return { kind, start: null, end: null, value: kind === "part_of_day" ? "morning" : null, label, crossesMidnight: false };
}

function ItemEditor({ item, findings, sourceDocument, update, remove, travelerOverride }) {
  const errors = messagesFor(findings, item.id);
  const first = (codes) => errors.find((finding) => codes.includes(finding.code));
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="overline">{item.kind === "transit" ? "TRANSIT" : "EVENT"}</Typography>
          <Button color="error" size="small" startIcon={<Delete />} onClick={remove}>移除誤判</Button>
        </Stack>
        <Field label="名稱" value={item.title} onChange={(value) => update("title", value)} error={first(["missing_item_title"])} />
        {item.kind === "event" && <TextField select label="類型" value={item.type ?? ""} onChange={(event) => update("type", event.target.value || null)} error={Boolean(first(["missing_event_type"]))} helperText={first(["missing_event_type"])?.message} fullWidth>{EVENT_TYPES.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}</TextField>}
        <Field label="地點（只保留來源或你的修正）" value={item.place} onChange={(value) => update("place", value)} />
        {item.kind === "transit" && <Stack direction={{ xs: "column", sm: "row" }} spacing={2}><Field label="起點" value={item.from} onChange={(value) => update("from", value)} /><Field label="終點" value={item.to} onChange={(value) => update("to", value)} /></Stack>}
        <TextField select label="時間語意" value={item.timing?.kind ?? ""} onChange={(event) => update("timing", timingFor(event.target.value, item.timing))} error={Boolean(first(["missing_timing_semantics"]))} helperText={first(["missing_timing_semantics"])?.message} fullWidth>{TIMING_KINDS.map((kind) => <MenuItem key={kind} value={kind}>{kind}</MenuItem>)}</TextField>
        {item.timing?.kind === "exact" && <Field label="開始時間" type="time" value={item.timing.start} onChange={(value) => update("timing.start", value)} error={first(["missing_exact_time", "invalid_time"])} InputLabelProps={{ shrink: true }} />}
        {item.timing?.kind === "range" && <Stack direction={{ xs: "column", sm: "row" }} spacing={2}><Field label="開始" type="time" value={item.timing.start} onChange={(value) => update("timing.start", value)} error={first(["invalid_time_range"])} InputLabelProps={{ shrink: true }} /><Field label="結束" type="time" value={item.timing.end} onChange={(value) => update("timing.end", value)} error={first(["invalid_time_range"])} InputLabelProps={{ shrink: true }} /></Stack>}
        {item.timing?.kind === "open_ended" && <Field label="開始時間（不虛構結束）" type="time" value={item.timing.start} onChange={(value) => update("timing.start", value)} error={first(["missing_open_ended_start"])} InputLabelProps={{ shrink: true }} />}
        {item.timing?.kind === "range" && <FormControlLabel control={<Checkbox checked={Boolean(item.timing.crossesMidnight)} onChange={(event) => update("timing.crossesMidnight", event.target.checked)} />} label="跨日" />}
        {item.timing?.kind === "approximate" && <Field label="約略時間" type="time" value={item.timing.value} onChange={(value) => update("timing.value", value)} error={first(["missing_approximate_time"])} InputLabelProps={{ shrink: true }} />}
        {item.timing?.kind === "part_of_day" && <TextField select label="時段" value={item.timing.value ?? "morning"} onChange={(event) => update("timing.value", event.target.value)} fullWidth>{["morning", "afternoon", "evening"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>}
        {item.timing && <Field label="來源時間標籤" value={item.timing.label} onChange={(value) => update("timing.label", value || "時間未指定")} />}
        <Field label="細節" value={item.details} onChange={(value) => update("details", value)} multiline />
        <Field label="備註" value={item.note} onChange={(value) => update("note", value)} multiline />
        <Stack direction={{ xs: "column", sm: "row" }}>
          {["flexible", "optional", "tentative"].map((field) => <FormControlLabel key={field} control={<Checkbox checked={item[field]} onChange={(event) => update(field, event.target.checked)} />} label={field} />)}
        </Stack>
        {item.kind === "event" && <TextField select label="行程關係" value={item.relation?.kind ?? "committed"} onChange={(event) => update("relation", event.target.value === "committed" ? null : { kind: event.target.value, groupId: item.relation?.groupId ?? null, condition: item.relation?.condition ?? null })} fullWidth>{["committed", "alternative", "conditional", "fallback"].map((kind) => <MenuItem key={kind} value={kind}>{kind}</MenuItem>)}</TextField>}
        {item.relation && <Stack direction={{ xs: "column", sm: "row" }} spacing={2}><Field label="關係群組" value={item.relation.groupId} onChange={(value) => update("relation.groupId", value)} /><Field label="條件說明" value={item.relation.condition} onChange={(value) => update("relation.condition", value)} /></Stack>}
        {item.type === "flight" && <Stack spacing={2} pl={{ sm: 2 }} borderLeft={2} borderColor="divider">
          <Typography fontWeight={700}>航班欄位</Typography>
          {[["班號", "code"], ["出發機場", "origin"], ["抵達機場", "destination"]].map(([label, field]) => <Field key={field} label={label} value={item.flight?.[field]} onChange={(value) => update(`flight.${field}`, value)} error={first(["incomplete_flight"])} />)}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>{[["起飛", "departure"], ["抵達", "arrival"]].map(([label, field]) => <Field key={field} label={label} type="time" value={item.flight?.[field]} onChange={(value) => update(`flight.${field}`, value)} error={first(["incomplete_flight", `invalid_flight_${field}`])} InputLabelProps={{ shrink: true }} />)}</Stack>
        </Stack>}
        {errors.filter((finding) => finding.severity === "warning").map((finding) => <Alert key={finding.id} severity="warning">{finding.message}</Alert>)}
        <Evidence entries={item.evidence} sourceDocument={sourceDocument} travelerOverride={travelerOverride} />
      </Stack>
    </Paper>
  );
}

export function TripReviewDialog({ initialSession, onCancel, onConfirm }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [session, setSession] = useState(initialSession);
  const summaryRef = useRef(null);
  const blockers = useMemo(() => session.findings.filter((finding) => finding.severity === "blocking"), [session]);
  const update = (entityId, field, value) => setSession((current) => applyReviewOverride(current, entityId, field, value));

  useEffect(() => { summaryRef.current?.focus(); }, []);
  const confirm = () => {
    if (blockers.length) { summaryRef.current?.focus(); return; }
    onConfirm(session);
  };

  const tripErrors = messagesFor(session.findings, session.draft.trip.id);
  const error = (codes) => tripErrors.find((finding) => codes.includes(finding.code));
  return (
    <Dialog open fullScreen={fullScreen} fullWidth maxWidth="md" aria-labelledby="trip-review-title">
      <DialogTitle id="trip-review-title">確認解析結果</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <ReviewFindingsSummary session={session} summaryRef={summaryRef} />
          <Typography variant="h2" fontSize={28}>旅程摘要</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Field label="旅程名稱" value={session.draft.trip.title} onChange={(value) => update(session.draft.trip.id, "title", value)} error={error(["missing_trip_title"])} />
            <Field label="主要目的地" value={session.draft.trip.destination} onChange={(value) => update(session.draft.trip.id, "destination", value)} error={error(["missing_destination"])} />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Field label="國家代碼" value={session.draft.trip.countryCode} onChange={(value) => update(session.draft.trip.id, "countryCode", value?.toUpperCase() ?? null)} error={error(["invalid_country_code"])} inputProps={{ maxLength: 2 }} />
            <Field label="IANA 時區" value={session.draft.trip.timezone} onChange={(value) => update(session.draft.trip.id, "timezone", value)} error={error(["invalid_timezone"])} />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Field label="開始日期" type="date" value={session.draft.trip.startDate} onChange={(value) => update(session.draft.trip.id, "startDate", value)} error={error(["missing_start_date", "invalid_trip_range"])} InputLabelProps={{ shrink: true }} />
            <Field label="結束日期" type="date" value={session.draft.trip.endDate} onChange={(value) => update(session.draft.trip.id, "endDate", value)} error={error(["missing_end_date", "invalid_trip_range"])} InputLabelProps={{ shrink: true }} />
          </Stack>
          <Divider />
          <Typography variant="h2" fontSize={28}>每日行程</Typography>
          {session.draft.days.map((day, dayIndex) => {
            const dayErrors = messagesFor(session.findings, day.id);
            return <Accordion key={day.id} defaultExpanded={dayIndex === 0} disableGutters>
              <AccordionSummary expandIcon={<ExpandMore />}><Stack direction="row" spacing={1} alignItems="center"><Typography fontWeight={700}>{day.title || `第 ${dayIndex + 1} 天`}</Typography><Chip size="small" label={`${day.items.length} items`} /></Stack></AccordionSummary>
              <AccordionDetails><Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Field label="日期" type="date" value={day.date} onChange={(value) => update(day.id, "date", value)} error={dayErrors.find((finding) => ["missing_day_date", "day_outside_trip"].includes(finding.code))} InputLabelProps={{ shrink: true }} />
                  <Field label="當日標題" value={day.title} onChange={(value) => update(day.id, "title", value)} error={dayErrors.find((finding) => finding.code === "missing_day_title")} />
                </Stack>
                <Evidence entries={day.evidence} sourceDocument={session.sourceDocument} />
                {day.items.map((item) => <ItemEditor key={item.id} item={item} findings={session.findings} sourceDocument={session.sourceDocument} travelerOverride={session.overrides.some((override) => override.entityId === item.id && override.field === "add")} update={(field, value) => update(item.id, field, value)} remove={() => setSession((current) => removeReviewItem(current, item.id))} />)}
                <Button startIcon={<Add />} variant="outlined" onClick={() => setSession((current) => addReviewItem(current, day.id))}>補上漏掉的行程</Button>
              </Stack></AccordionDetails>
            </Accordion>;
          })}
          {session.draft.reservations.length > 0 && <><Divider /><Typography variant="h2" fontSize={28}>預約與票券</Typography>{session.draft.reservations.map((reservation) => <Paper key={reservation.id} variant="outlined" sx={{ p: 2 }}><Stack spacing={2}><Field label="名稱" value={reservation.title} onChange={(value) => update(reservation.id, "title", value)} /><Field label="日期標籤" value={reservation.dateLabel} onChange={(value) => update(reservation.id, "dateLabel", value)} /><Field label="待辦文字" value={reservation.todoLabel} onChange={(value) => update(reservation.id, "todoLabel", value)} /><Field label="完成狀態" value={reservation.completeStatus} onChange={(value) => update(reservation.id, "completeStatus", value)} /><Evidence entries={reservation.evidence} sourceDocument={session.sourceDocument} /></Stack></Paper>)}</>}
          <ReferenceBlocksReview references={session.draft.referenceBlocks} sourceDocument={session.sourceDocument} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onCancel}>取消並丟棄 Review</Button>
        <Button variant="contained" onClick={confirm} disabled={blockers.length > 0}>確認並開啟旅程</Button>
      </DialogActions>
    </Dialog>
  );
}
