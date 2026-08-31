import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { appTheme } from "../../appTheme";
import {
  AppBar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  CalendarMonth,
  Close,
  Directions,
  EventNote,
  Flight,
  Hotel,
  Map,
  MoreHoriz,
  Restaurant,
  Today,
  Work,
  Attractions,
  Train,
  Coffee,
  CheckCircle,
  WarningAmber,
} from "@mui/icons-material";
import { selectViewerModel } from "../../domain/trip/selectors";
import {
  getTripRuntime,
  minutesUntilTrip,
  selectNextConfirmedEvent,
  selectRuntimeCandidates,
} from "../../domain/trip/runtime";
import { useTripTodos } from "./useTripTodos";
import {
  importReducer,
  viewingImportState,
} from "../trip-import/importReducer";
import { clearLocalTripData } from "../../storage/tripStorage";
import { CanonicalTripControls } from "../trip-import/CanonicalTripControls";

const TripImportWorkflow = React.lazy(() => import("../trip-import/TripImportWorkflow").then((module) => ({ default: module.TripImportWorkflow })));

const ViewerDataContext = createContext(null);

function useViewerData() {
  const value = useContext(ViewerDataContext);
  if (!value) throw new Error("Viewer components require canonical trip data.");
  return value;
}

const icons = {
  flight: Flight,
  hotel: Hotel,
  work: Work,
  activity: Attractions,
  restaurant: Restaurant,
  transport: Train,
  free_time: Coffee,
};
const mapUrl = (q) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const mapHref = (place) =>
  place?.startsWith("https://") ? place : mapUrl(place);

function TripStatusView({ runtime }) {
  const { canonicalTrip, trip, days } = useViewerData();
  if (runtime.phase === "after")
    return (
      <Paper className="border-y border-trip-ink bg-trip-surface p-8 text-center md:p-14">
        <Typography variant="overline" color="secondary">
          TRIP COMPLETED
        </Typography>
        <Typography variant="h1" fontSize={{ xs: 38, md: 56 }} mt={2}>
          {trip.title}
        </Typography>
        <Typography color="text.secondary" mt={2}>
          旅程已結束，完整行程仍可從 Day 查看。
        </Typography>
      </Paper>
    );
  const daysToGo = minutesUntilTrip(canonicalTrip, runtime);
  const nextCandidate = selectNextConfirmedEvent(canonicalTrip, runtime);
  const nextDay = nextCandidate ? days.find((day) => day.date === nextCandidate.date) : null;
  const nextEvent = nextDay?.events.find((event) => event.id === nextCandidate?.event.id);
  return (
    <Paper className="border-y border-trip-ink bg-trip-surface p-6 md:p-10">
      <Typography variant="overline" color="secondary">
        UP NEXT
      </Typography>
      <Typography variant="h1" fontSize={{ xs: 38, md: 56 }} mt={1}>
        {daysToGo} days to go
      </Typography>
      <Typography color="text.secondary" mt={1}>
        目前 {canonicalTrip.timezone} 日期：{runtime.date}
      </Typography>
      {nextEvent && (
        <>
          <Divider sx={{ my: 3 }} />
          <Stack direction="row" spacing={2} alignItems="center">
            <EventIcon type={nextEvent.type} />
            <Box>
              <Typography variant="h3" fontSize={20}>
                {nextEvent.title} · {nextDay.month} {nextDay.n}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {[nextEvent.time, nextEvent.meta].filter(Boolean).join(" · ")}
              </Typography>
            </Box>
          </Stack>
        </>
      )}
    </Paper>
  );
}

function DateRail({ selected, onSelect }) {
  const { days } = useViewerData();
  return (
    <Paper
      className="sticky top-0 z-10 border-b border-black/10 bg-trip-paper/95 backdrop-blur-xl"
      square
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "rgba(243,241,235,.94)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <Tabs
          value={selected}
          onChange={(_, v) => onSelect(v)}
          variant="fullWidth"
          aria-label="選擇旅行日期"
          sx={{
            minHeight: 76,
            "& .MuiTab-root": {
              minWidth: 0,
              minHeight: 76,
              p: 0.5,
              fontSize: 10,
            },
            "& .Mui-selected": { color: "text.primary" },
          }}
        >
          {days.map((d) => (
            <Tab
              key={d.date}
              value={d.date}
              onClick={() => {
                if (selected === d.date) onSelect(d.date);
              }}
              label={
                <Stack spacing={0} alignItems="center">
                  <Typography
                    fontFamily="ui-monospace"
                    fontSize={18}
                    fontWeight={700}
                  >
                    {d.n}
                  </Typography>
                  <Typography fontFamily="ui-monospace" fontSize={9}>
                    {d.dow}
                  </Typography>
                  <Typography fontSize={10}>{d.label}</Typography>
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Container>
    </Paper>
  );
}

function EventIcon({ type }) {
  const Icon = icons[type] || EventNote;
  return (
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        bgcolor: "background.default",
        display: "grid",
        placeItems: "center",
        flex: "0 0 auto",
      }}
    >
      <Icon sx={{ fontSize: 18, color: "primary.main" }} />
    </Box>
  );
}
function EventCard({ event }) {
  if (event.transit)
    return (
      <Stack
        className="ml-4 border-l border-dashed border-trip-muted/70 py-1.5 pl-6"
        direction="row"
        spacing={1.5}
        sx={{
          ml: 2,
          py: 1.5,
          borderLeft: "1px dashed",
          borderColor: "text.secondary",
          pl: 3,
        }}
      >
        <Train fontSize="small" color="disabled" />
        <Typography variant="caption" color="text.secondary">
          <b>{event.transit}</b>
          {(event.from || event.to) && ` · ${[event.from, event.to].filter(Boolean).join(" → ")}`}
          {event.tip && ` · ${event.tip}`}
        </Typography>
      </Stack>
    );
  return (
    <Paper
      className="border-t border-black/10 transition-colors duration-200 hover:bg-white/60"
      component="article"
      sx={{ p: 2.5, borderTop: 1, borderColor: "divider" }}
    >
      <Stack direction="row" spacing={2}>
        <Typography
          width={50}
          flexShrink={0}
          fontFamily="ui-monospace"
          fontSize={11}
          color="text.secondary"
          pt={1}
        >
          {event.time}
        </Typography>
        <EventIcon type={event.type} />
        <Box flex={1} minWidth={0}>
          <Typography variant="h3" fontSize={19}>
            {event.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {event.meta}
          </Typography>
          {event.status && (
            <Chip
              icon={<CheckCircle />}
              label={event.status}
              color="success"
              size="small"
              sx={{ mt: 1.5 }}
            />
          )}
          {event.flexible && (
            <Chip
              label="FLEXIBLE"
              variant="outlined"
              size="small"
              sx={{ mt: 1.5, ml: event.status ? 1 : 0 }}
            />
          )}
          {event.relation && (
            <Chip
              label={`${event.relation.kind.toUpperCase()} · ${event.relation.groupId}`}
              variant="outlined"
              color={event.relation.kind === "fallback" ? "warning" : "default"}
              size="small"
              sx={{ mt: 1.5, ml: event.status || event.flexible ? 1 : 0 }}
            />
          )}
          {event.note && (
            <Typography
              sx={{
                mt: 2,
                pl: 1.5,
                borderLeft: 3,
                borderColor: "#d9ef6f",
                fontFamily: '"Noto Serif TC",serif',
                fontWeight: 700,
              }}
            >
              「{event.note}」
            </Typography>
          )}
          <Stack direction="row" spacing={1} mt={1.5}>
            {event.map && (
              <Button
                size="small"
                startIcon={<Directions />}
                href={mapHref(event.map)}
                target="_blank"
                rel="noreferrer"
              >
                {event.mapIsFallback ? "Search Maps · unresolved" : "Directions"}
              </Button>
            )}
            {event.tabelog && (
              <Button
                size="small"
                color="secondary"
                href={event.tabelog}
                target="_blank"
                rel="noreferrer"
              >
                食べログ
              </Button>
            )}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

function DayView({ day }) {
  return (
    <>
      <Typography variant="overline" color="secondary">
        {day.dow} · {day.month} {day.n}
      </Typography>
      <Typography variant="h1" fontSize={{ xs: 38, md: 56 }} mt={1}>
        {day.title}
      </Typography>
      <Typography color="text.secondary" mt={1}>
        {day.subtitle}
      </Typography>
      {day.special ? (
        <Paper
          className="my-10 border-y border-trip-ink bg-trip-surface px-6 py-12 text-center md:px-16 md:py-20"
          sx={{
            my: 5,
            p: { xs: 4, md: 8 },
            textAlign: "center",
            borderTop: 1,
            borderBottom: 1,
            borderColor: "text.primary",
          }}
        >
          <EventIcon type={day.events[0].type} />
          <Typography
            variant="overline"
            display="block"
            color="secondary"
            mt={2}
          >
            {day.events[0].time}
          </Typography>
          <Typography variant="h2" fontSize={{ xs: 32, md: 48 }} my={3}>
            {day.events[0].title}
          </Typography>
          {day.events[0].meta && <Typography>{day.events[0].meta}</Typography>}
          {day.events[0].map && (
            <Button sx={{ mt: 2 }} startIcon={<Map />} href={day.events[0].map} target="_blank" rel="noreferrer">
              {day.events[0].mapIsFallback ? "Search Maps · unresolved" : "Open map"}
            </Button>
          )}
        </Paper>
      ) : (
        <Stack mt={5}>
          {day.events.map((e, i) => (
            <EventCard key={i} event={e} />
          ))}
        </Stack>
      )}
      {day.optional.length > 0 && (
        <Paper sx={{ mt: 4, p: 3, bgcolor: "#e9e7e0" }}>
          <Typography variant="overline" color="text.secondary">
            IF YOU STILL HAVE ENERGY
          </Typography>
          <Stack direction="row" gap={1} flexWrap="wrap" mt={2}>
            {day.optional.map((place) => (
              <Chip
                className="transition-colors hover:bg-white"
                key={place.name}
                icon={<Map />}
                label={place.name}
                variant="outlined"
                component="a"
                href={place.map}
                target="_blank"
                rel="noreferrer"
                clickable
              />
            ))}
          </Stack>
        </Paper>
      )}
    </>
  );
}

function TodayView({ day, onFullDay, runtime }) {
  const { canonicalTrip } = useViewerData();
  const runtimeSelection = selectRuntimeCandidates(
    day.canonicalDay,
    runtime.minutes,
  );
  const current = day.events.find(
    (event) => event.id === runtimeSelection.current?.id,
  );
  const next = day.events.find(
    (event) => event.id === runtimeSelection.next?.id,
  );
  if (!current && !next)
    return (
      <>
        <Typography variant="overline" color="secondary">
          TODAY · {String(Math.floor(runtime.minutes / 60)).padStart(2, "0")}:
          {String(runtime.minutes % 60).padStart(2, "0")} · {canonicalTrip.timezone}
        </Typography>
        <Typography color="text.secondary" variant="body2" mt={1} mb={4}>
          此日沒有足夠精確的時間資料，因此不顯示推測的 NOW。
        </Typography>
        <DayView day={day} />
      </>
    );
  return (
    <>
      <Typography variant="overline" color="secondary">
        TODAY · {day.dow} · {day.month} {day.n}
      </Typography>
      <Typography variant="h1" fontSize={{ xs: 38, md: 56 }} mt={1}>
        {day.title}
      </Typography>
      <Typography color="text.secondary" mt={1}>
        {day.subtitle}
      </Typography>
      <Paper
        className="mt-10 border-y border-trip-ink bg-trip-surface p-5 md:p-8"
        sx={{
          mt: 5,
          p: { xs: 2.5, md: 4 },
          borderTop: 1,
          borderBottom: 1,
          borderColor: "text.primary",
        }}
      >
        <Typography variant="overline" color="secondary">
          {current ? "NOW" : "TODAY"}
        </Typography>
        <Stack direction="row" spacing={2} mt={1.5}>
          <EventIcon type={current?.type || "transport"} />
          <Box>
            <Typography variant="h2" fontSize={25}>
              {current?.title || `${day.title}自由行程`}
            </Typography>
            <Typography color="text.secondary" variant="body2" mt={0.5}>
              {current?.meta || "時間彈性，因此不推測目前所在的景點。"}
            </Typography>
            {current?.note && (
              <Typography
                mt={2}
                fontFamily='"Noto Serif TC",serif'
                fontWeight={700}
              >
                「{current.note}」
              </Typography>
            )}
          </Box>
        </Stack>
        {next && (
          <>
            <Divider sx={{ my: 3, borderStyle: "dashed" }} />
            <Typography variant="overline" color="secondary">
              NEXT
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              mt={1.5}
              alignItems={{ sm: "center" }}
            >
              <Typography fontFamily="ui-monospace" fontWeight={700}>
                {next?.time}
              </Typography>
              <Box flex={1}>
                <Typography variant="h3" fontSize={20}>
                  {next?.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {next?.meta}
                </Typography>
                {next?.status && (
                  <Chip
                    size="small"
                    color="success"
                    label={`✓ ${next.status}`}
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
              {day.suggestedDeparture && next && (
                <Paper
                  sx={{
                    p: 1.5,
                    bgcolor: "text.primary",
                    color: "white",
                    textAlign: "right",
                  }}
                >
                  <Typography variant="overline" fontSize={9}>
                    SUGGESTED DEPARTURE
                  </Typography>
                  <Typography
                    color="#d9ef6f"
                    fontFamily="ui-monospace"
                    fontWeight={700}
                  >
                    {day.suggestedDeparture}
                  </Typography>
                </Paper>
              )}
            </Stack>
          </>
        )}
        <Stack direction="row" spacing={1} mt={3}>
          {next?.map && (
            <Button
              variant="contained"
              startIcon={<Directions />}
              href={mapHref(next.map)}
              target="_blank"
              rel="noreferrer"
            >
              {next.mapIsFallback ? "Search Maps · unresolved" : "Directions"}
            </Button>
          )}
          <Button onClick={onFullDay}>View full day</Button>
        </Stack>
      </Paper>
    </>
  );
}

function Overview({ onDay }) {
  const { trip, days } = useViewerData();
  return (
    <>
      <Typography variant="overline" color="secondary">
        YOUR TRIP · {trip.days} {trip.days === 1 ? "DAY" : "DAYS"}
      </Typography>
      <Typography variant="h1" fontSize={{ xs: 43, md: 68 }} mt={1}>
        {trip.title}
      </Typography>
      <Stack divider={<Divider />} mt={5}>
        {trip.flights.length > 0 && (
          <Box py={3}>
            <Typography variant="overline" color="secondary">
              FLIGHTS
            </Typography>
            {trip.flights.map((f) => (
              <Stack
                key={f.code}
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                mt={2}
              >
                <Typography width={70} fontFamily="ui-monospace">
                  {f.code}
                </Typography>
                <Box>
                  <Typography fontFamily="ui-monospace" fontWeight={700}>
                    {f.route}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {f.date}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Box>
        )}
        {trip.stay && (
          <Box py={3}>
            <Typography variant="overline" color="secondary">
              STAY
            </Typography>
            <Typography variant="h3" fontSize={20} mt={2}>
              {trip.stay.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {trip.stay.period} · {trip.stay.details}
            </Typography>
          </Box>
        )}
        <Box py={3}>
          <Typography variant="overline" color="secondary">
            ITINERARY
          </Typography>
          <List disablePadding sx={{ mt: 1 }}>
            {days.map((d) => (
              <ListItemButton
                key={d.date}
                onClick={() => onDay(d.date)}
                sx={{ px: 0, borderBottom: 1, borderColor: "divider" }}
              >
                <Typography
                  width={50}
                  fontFamily="ui-monospace"
                  fontWeight={700}
                >
                  {d.n}
                </Typography>
                <Typography
                  width={50}
                  fontFamily="ui-monospace"
                  fontSize={10}
                  color="text.secondary"
                >
                  {d.dow}
                </Typography>
                <Typography>
                  {d.title}{d.subtitle ? ` · ${d.subtitle}` : ""}
                </Typography>
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Stack>
    </>
  );
}

function Reservations() {
  const { canonicalTrip, initialTodos, reservations } = useViewerData();
  const [todos, toggleTodo] = useTripTodos(canonicalTrip.id, initialTodos);
  const completed = todos.filter((t) => t.done).length;
  const todoState = Object.fromEntries(todos.map((t) => [t.id, t.done]));
  return (
    <>
      {todos.length > 0 && (
        <>
          <Typography variant="overline" color="secondary">
            BEFORE YOU GO
          </Typography>
          <Typography variant="h1" fontSize={{ xs: 38, md: 56 }} mt={1}>
            Trip checklist
          </Typography>
          <Paper
        className="mt-8 border-y border-trip-ink bg-trip-surface p-4 md:p-6"
        sx={{
          mt: 4,
          p: { xs: 2, md: 3 },
          borderTop: 1,
          borderBottom: 1,
          borderColor: "text.primary",
        }}
          >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
        >
          <Typography fontWeight={700}>出發前確認</Typography>
          <Typography variant="caption" fontFamily="ui-monospace">
            {completed} / {todos.length}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={(completed / todos.length) * 100}
          color={completed === todos.length ? "success" : "secondary"}
          sx={{ my: 2, height: 4 }}
        />
        <List disablePadding>
          {todos.map((todo) => (
            <ListItemButton
              key={todo.id}
              onClick={() => toggleTodo(todo.id)}
              dense
              sx={{ px: 0, borderTop: 1, borderColor: "divider" }}
            >
              <ListItemIcon sx={{ minWidth: 42 }}>
                <Checkbox
                  edge="start"
                  checked={todo.done}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ "aria-label": todo.label }}
                />
              </ListItemIcon>
              <ListItemText
                primary={todo.label}
                primaryTypographyProps={{
                  sx: {
                    textDecoration: todo.done ? "line-through" : "none",
                    color: todo.done ? "text.secondary" : "text.primary",
                  },
                }}
              />
            </ListItemButton>
          ))}
        </List>
          </Paper>
        </>
      )}
      {reservations.length > 0 ? (
        <>
          <Typography variant="overline" color="secondary" display="block" mt={6}>
            RESERVATIONS
          </Typography>
          <Typography variant="h2" fontSize={30} mt={1}>
            預約與票券
          </Typography>
          <Stack mt={3} divider={<Divider />}>
        {reservations.map((r) => {
          const done = todoState[r.todoId];
          const status = done
            ? r.completeStatus
            : r.pendingStatus || "Action needed";
          return (
            <Stack
              key={r.title}
              direction="row"
              spacing={2}
              py={2.5}
              alignItems="center"
            >
              <Typography width={92} fontFamily="ui-monospace" fontSize={11}>
                {r.date}
              </Typography>
              <EventIcon type={r.type} />
              <Box flex={1}>
                <Typography variant="h3" fontSize={17}>
                  {r.title}
                </Typography>
              </Box>
              <Chip
                icon={done ? <CheckCircle /> : <WarningAmber />}
                label={status}
                color={done ? "success" : "warning"}
                size="small"
              />
            </Stack>
          );
        })}
          </Stack>
        </>
      ) : (
        <Typography color="text.secondary">這趟旅行沒有已確認的預約或票券。</Typography>
      )}
    </>
  );
}

export function TripViewer({ canonicalTrip, onExitSample, sampleMode = false }) {
  const viewerData = useMemo(
    () => ({ canonicalTrip, ...selectViewerModel(canonicalTrip) }),
    [canonicalTrip],
  );
  const { trip, days } = viewerData;
  const mobile = useMediaQuery(appTheme.breakpoints.down("sm"));
  const [importState, dispatchImport] = useReducer(
    importReducer,
    canonicalTrip.id,
    viewingImportState,
  );
  const [runtime, setRuntime] = useState(() => getTripRuntime(canonicalTrip));
  const [view, setView] = useState(
    runtime.phase === "during" ? "today" : "overview",
  );
  const [date, setDate] = useState(
    runtime.phase === "during" ? runtime.date : days[0].date,
  );
  const [drawer, setDrawer] = useState(false);
  const [importLoaded, setImportLoaded] = useState(false);
  const [clearDialog, setClearDialog] = useState(false);
  useEffect(() => {
    const refreshRuntime = () => {
      const nextRuntime = getTripRuntime(canonicalTrip);
      setRuntime(nextRuntime);
      if (view === "today" && nextRuntime.phase === "during")
        setDate(nextRuntime.date);
    };
    const timer = window.setInterval(refreshRuntime, 60000);
    return () => window.clearInterval(timer);
  }, [view]);
  const day = useMemo(
    () => days.find((d) => d.date === date) || days[0],
    [date],
  );
  const selectDay = (d) => {
    setDate(d);
    setView("day");
  };
  const selectView = (nextView) => {
    if (nextView === "today" && runtime.phase === "during")
      setDate(runtime.date);
    setView(nextView);
  };
  return (
    <ViewerDataContext.Provider value={viewerData}>
      <Box
        className="min-h-screen bg-trip-paper text-trip-ink"
        minHeight="100vh"
        bgcolor="background.default"
        pb={mobile ? 9 : 3}
        data-import-state={importState.status}
      >
        <AppBar
          className="bg-trip-moss"
          position="static"
          elevation={0}
          sx={{ bgcolor: "primary.main" }}
        >
          <Container className="px-5 md:px-8" maxWidth="lg">
            <Stack direction="row" justifyContent="space-between" py={3}>
              <Box>
                <Typography variant="overline" color="#d9ef6f">
                  {trip.countryCode === "JP" ? "JAPAN" : trip.countryCode} · {trip.year}
                </Typography>
                <Typography variant="h2" fontSize={25} color="white">
                  {trip.title}
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,.7)">
                  {trip.period} · {trip.days} {trip.days === 1 ? "DAY" : "DAYS"}
                </Typography>
              </Box>
              <IconButton
                color="inherit"
                onClick={() => {
                  setImportLoaded(true);
                  setDrawer(true);
                }}
                aria-label="開啟選單"
              >
                <MoreHoriz />
              </IconButton>
            </Stack>
          </Container>
        </AppBar>
        <DateRail selected={date} onSelect={selectDay} />
        <Container
          className="px-5 py-10 md:px-8 md:py-14"
          maxWidth="md"
          sx={{ py: { xs: 4, md: 7 } }}
        >
          {view === "overview" ? (
            <Overview onDay={selectDay} />
          ) : view === "today" ? (
            runtime.phase === "during" ? (
              <TodayView
                day={day}
                runtime={runtime}
                onFullDay={() => setView("day")}
              />
            ) : (
              <TripStatusView runtime={runtime} />
            )
          ) : view === "reservations" ? (
            <Reservations />
          ) : (
            <DayView day={day} />
          )}
        </Container>
        <Drawer anchor="right" open={drawer} onClose={() => setDrawer(false)}>
          <Box width={{ xs: 300, sm: 380 }} p={3}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="overline">TRIP MENU</Typography>
              <IconButton onClick={() => setDrawer(false)}>
                <Close />
              </IconButton>
            </Stack>
            <List sx={{ mt: 3 }}>
              {[
                ["overview", "Trip Overview"],
                ["today", "Today / Now"],
                ["reservations", "Reservations"],
              ].map(([v, l]) => (
                <ListItemButton
                  key={v}
                  onClick={() => {
                    selectView(v);
                    setDrawer(false);
                  }}
                  sx={{ borderTop: 1, borderColor: "divider" }}
                >
                  {l}
                </ListItemButton>
              ))}
            </List>
            <Typography
              color="text.secondary"
              mt={8}
              fontFamily='"Noto Serif TC",serif'
            >
              不要把旅行排成 KPI。
              <br />
              保留臨時起意的空間。
            </Typography>
            <CanonicalTripControls trip={canonicalTrip} />
            {importLoaded && (
              <React.Suspense fallback={<Typography role="status">正在載入匯入工具…</Typography>}>
                <TripImportWorkflow state={importState} dispatch={dispatchImport} />
              </React.Suspense>
            )}
            <Button
              color="error"
              variant="outlined"
              sx={{ mt: 4 }}
              onClick={() => setClearDialog(true)}
            >
              {sampleMode ? "離開大阪範例" : "清除這趟本機旅程"}
            </Button>
          </Box>
        </Drawer>
        <Dialog open={clearDialog} onClose={() => setClearDialog(false)}>
          <DialogTitle>{sampleMode ? "離開大阪範例？" : "清除這趟本機旅程？"}</DialogTitle>
          <DialogContent>
            {sampleMode
              ? "範例不會儲存成你的已確認旅程；離開後會回到 Home。"
              : "這會移除已匯入的旅程與 checklist 狀態並回到 Home。個人 AI provider key 會保留，需另行明確清除。"}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClearDialog(false)}>取消</Button>
            <Button
              color="error"
              onClick={async () => {
                if (sampleMode) {
                  setClearDialog(false);
                  onExitSample?.();
                } else {
                  clearLocalTripData();
                  window.location.reload();
                }
              }}
            >
              {sampleMode ? "確認離開" : "確認清除"}
            </Button>
          </DialogActions>
        </Dialog>
        {mobile && (
          <Paper
            className="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-trip-surface/95 backdrop-blur-xl"
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <BottomNavigation
              value={view}
              onChange={(_, v) => selectView(v)}
              showLabels
            >
              <BottomNavigationAction
                value="today"
                label="Today"
                icon={<Today />}
              />
              <BottomNavigationAction
                value="overview"
                label="Overview"
                icon={<CalendarMonth />}
              />
              <BottomNavigationAction
                value="day"
                label="Day"
                icon={<EventNote />}
              />
              <BottomNavigationAction
                value="reservations"
                label="Bookings"
                icon={<CheckCircle />}
              />
            </BottomNavigation>
          </Paper>
        )}
      </Box>
    </ViewerDataContext.Provider>
  );
}
