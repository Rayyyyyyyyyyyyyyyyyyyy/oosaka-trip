import { useMemo, useState } from "react";
import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  CalendarMonth,
  CheckCircle,
  EventNote,
  MoreHoriz,
  Today,
} from "@mui/icons-material";
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

export function TripViewer({
  canonicalTrip,
  onExitSample,
  onTripConfirmed,
  onTripImported,
  onTripCleared,
  sampleMode = false,
}) {
  const viewerData = useMemo(
    () => ({ canonicalTrip, ...selectViewerModel(canonicalTrip) }),
    [canonicalTrip],
  );
  const { trip, days } = viewerData;
  const mobile = useMediaQuery(appTheme.breakpoints.down("sm"));
  const importWorkflow = useTripImportWorkflow({
    tripId: canonicalTrip.id,
    onTripConfirmed,
  });
  const navigation = useRuntimeNavigation(canonicalTrip, days);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ViewerDataContext.Provider value={viewerData}>
      <div
        className="min-h-screen bg-trip-paper pb-24 text-trip-ink sm:pb-3"
        data-import-state={importWorkflow.state.status}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: "var(--trip-color-travel)",
            borderBottom: "1px solid rgba(255,250,240,.16)",
          }}
        >
          <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
            <div className="flex items-center justify-between py-4 md:py-[18px]">
              <div>
                <Typography variant="overline" color="var(--trip-color-warmth)">
                  TRIP RUNTIME ·{" "}
                  {trip.countryCode === "JP" ? "JAPAN" : trip.countryCode} ·{" "}
                  {trip.year}
                </Typography>
                <Typography
                  variant="h2"
                  className="!text-xl md:!text-[23px]"
                  color="#fffaf0"
                >
                  {trip.title}
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,.7)">
                  {trip.period} · {trip.days} {trip.days === 1 ? "DAY" : "DAYS"}
                </Typography>
              </div>
              <IconButton
                color="inherit"
                onClick={() => setMenuOpen(true)}
                aria-label="開啟選單"
              >
                <MoreHoriz />
              </IconButton>
            </div>
          </div>
        </AppBar>

        {navigation.view !== "overview" && (
          <DateRail
            selected={navigation.date}
            onSelect={navigation.selectDay}
          />
        )}
        <main className="mx-auto w-full max-w-[var(--trip-folio-measure)] px-5 py-8 sm:px-8 md:px-10 md:py-14">
          {navigation.view === "overview" ? (
            <Overview
              onDay={navigation.selectDay}
              onReservations={() => navigation.selectView("reservations")}
            />
          ) : navigation.view === "today" ? (
            !navigation.runtime.available ? (
              <RuntimeUnavailableView />
            ) : navigation.runtime.phase === "during" ? (
              <TodayView
                day={navigation.day}
                runtime={navigation.runtime}
                onFullDay={navigation.showFullDay}
              />
            ) : (
              <TripStatusView runtime={navigation.runtime} />
            )
          ) : navigation.view === "reservations" ? (
            <ReservationsView />
          ) : (
            <DayView
              day={navigation.day}
              onOverview={() => navigation.selectView("overview")}
            />
          )}
        </main>

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
          <Paper className="!fixed inset-x-0 bottom-0 z-20 border-t !border-trip-hairline !bg-[color-mix(in_srgb,var(--trip-color-surface)_94%,transparent)] backdrop-blur-xl">
            <BottomNavigation
              value={navigation.view}
              onChange={(_, view) => navigation.selectView(view)}
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
      </div>
    </ViewerDataContext.Provider>
  );
}
