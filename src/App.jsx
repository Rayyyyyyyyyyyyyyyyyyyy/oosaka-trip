import { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  CalendarMonth,
  Close,
  EventNote,
  MoreHoriz,
  Today,
} from "@mui/icons-material";
import { days, trip } from "./data/tripData";
import { DateRail } from "./components/DateRail";
import { getTokyoRuntime } from "./lib/tripRuntime";
import { theme } from "./theme";
import { DayView } from "./views/DayView";
import { Overview } from "./views/Overview";
import { TodayView } from "./views/TodayView";
import { TripStatusView } from "./views/TripStatusView";

export function App() {
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [runtime, setRuntime] = useState(getTokyoRuntime);
  const [view, setView] = useState(
    runtime.phase === "during" ? "today" : "overview",
  );
  const [date, setDate] = useState(
    runtime.phase === "during" ? runtime.date : days[0].date,
  );
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    const refreshRuntime = () => {
      const nextRuntime = getTokyoRuntime();
      setRuntime(nextRuntime);
      if (view === "today" && nextRuntime.phase === "during")
        setDate(nextRuntime.date);
    };
    const timer = window.setInterval(refreshRuntime, 60000);
    return () => window.clearInterval(timer);
  }, [view]);

  const day = useMemo(
    () => days.find((candidate) => candidate.date === date) || days[0],
    [date],
  );
  const selectDay = (nextDate) => {
    setDate(nextDate);
    setView("day");
  };
  const selectView = (nextView) => {
    if (nextView === "today" && runtime.phase === "during")
      setDate(runtime.date);
    setView(nextView);
  };

  return (
    <Box
      className="min-h-screen bg-trip-paper text-trip-ink"
      minHeight="100vh"
      bgcolor="background.default"
      pb={mobile ? 9 : 3}
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
                JAPAN · 2026
              </Typography>
              <Typography variant="h2" fontSize={25} color="white">
                {trip.title}
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,.7)">
                {trip.period} · 6 DAYS
              </Typography>
            </Box>
            <IconButton
              color="inherit"
              onClick={() => setDrawer(true)}
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
            ].map(([value, label]) => (
              <ListItemButton
                key={value}
                onClick={() => {
                  selectView(value);
                  setDrawer(false);
                }}
                sx={{ borderTop: 1, borderColor: "divider" }}
              >
                {label}
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
        </Box>
      </Drawer>
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
            onChange={(_, value) => selectView(value)}
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
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
