import { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Container,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { CalendarMonth, CheckCircle, EventNote, MoreHoriz, Today } from "@mui/icons-material";
import { appTheme } from "../../appTheme";
import { selectViewerModel } from "../../domain/trip/selectors";
import { useTripImportWorkflow } from "../trip-import/useTripImportWorkflow";
import { DateRail } from "./DateRail";
import { DayView } from "./DayView";
import { Overview } from "./Overview";
import { ReservationsView } from "./ReservationsView";
import { TodayView, RuntimeUnavailableView, TripStatusView } from "./TodayView";
import { TripMenu } from "./TripMenu";
import { useRuntimeNavigation } from "./useRuntimeNavigation";
import { ViewerDataContext } from "./viewerContext";

export function TripViewer({ canonicalTrip, onExitSample, onTripConfirmed, onTripImported, onTripCleared, sampleMode = false }) {
  const viewerData = useMemo(() => ({ canonicalTrip, ...selectViewerModel(canonicalTrip) }), [canonicalTrip]);
  const { trip, days } = viewerData;
  const mobile = useMediaQuery(appTheme.breakpoints.down("sm"));
  const importWorkflow = useTripImportWorkflow({ tripId: canonicalTrip.id, onTripConfirmed });
  const navigation = useRuntimeNavigation(canonicalTrip, days);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ViewerDataContext.Provider value={viewerData}>
      <Box minHeight="100vh" bgcolor="background.default" color="text.primary" pb={mobile ? 9 : 3} data-import-state={importWorkflow.state.status}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: "primary.main" }}>
          <Container maxWidth="lg" sx={{ px: { xs: 2.5, md: 4 } }}>
            <Stack direction="row" justifyContent="space-between" py={3}>
              <Box>
                <Typography variant="overline" color="var(--trip-color-acid)">{trip.countryCode === "JP" ? "JAPAN" : trip.countryCode} · {trip.year}</Typography>
                <Typography variant="h2" fontSize={25} color="white">{trip.title}</Typography>
                <Typography variant="caption" color="rgba(255,255,255,.7)">{trip.period} · {trip.days} {trip.days === 1 ? "DAY" : "DAYS"}</Typography>
              </Box>
              <IconButton color="inherit" onClick={() => setMenuOpen(true)} aria-label="開啟選單"><MoreHoriz /></IconButton>
            </Stack>
          </Container>
        </AppBar>

        <DateRail selected={navigation.date} onSelect={navigation.selectDay} />
        <Container maxWidth="md" sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 4, md: 7 } }}>
          {navigation.view === "overview" ? (
            <Overview onDay={navigation.selectDay} />
          ) : navigation.view === "today" ? (
            !navigation.runtime.available ? (
              <RuntimeUnavailableView />
            ) : navigation.runtime.phase === "during" ? (
              <TodayView day={navigation.day} runtime={navigation.runtime} onFullDay={navigation.showFullDay} />
            ) : (
              <TripStatusView runtime={navigation.runtime} />
            )
          ) : navigation.view === "reservations" ? (
            <ReservationsView />
          ) : (
            <DayView day={navigation.day} />
          )}
        </Container>

        <TripMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onSelectView={navigation.selectView}
          canonicalTrip={canonicalTrip}
          importWorkflow={importWorkflow}
          onTripImported={onTripImported}
          onTripCleared={onTripCleared}
          onExitSample={onExitSample}
          sampleMode={sampleMode}
        />

        {mobile && (
          <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20, borderTop: 1, borderColor: "divider", bgcolor: "color-mix(in srgb, var(--trip-color-surface) 95%, transparent)", backdropFilter: "blur(12px)" }}>
            <BottomNavigation value={navigation.view} onChange={(_, view) => navigation.selectView(view)} showLabels>
              <BottomNavigationAction value="today" label="Today" icon={<Today />} />
              <BottomNavigationAction value="overview" label="Overview" icon={<CalendarMonth />} />
              <BottomNavigationAction value="day" label="Day" icon={<EventNote />} />
              <BottomNavigationAction value="reservations" label="Bookings" icon={<CheckCircle />} />
            </BottomNavigation>
          </Paper>
        )}
      </Box>
    </ViewerDataContext.Provider>
  );
}
