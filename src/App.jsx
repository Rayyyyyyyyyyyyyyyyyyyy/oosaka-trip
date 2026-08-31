import { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { appTheme } from "./appTheme";
import { TripHome } from "./features/trip-import/TripHome";
import { TripViewer } from "./features/trip-viewer/TripViewer";
import { parseCanonicalTrip } from "./domain/trip/schema";
import { loadCanonicalTripState } from "./storage/tripStorage";
import { osakaSampleTrip } from "./tripData";

function initialAppState(initialTrip) {
  if (initialTrip === undefined) {
    const persisted = loadCanonicalTripState();
    return {
      activeTrip: persisted.trip,
      sampleMode: false,
      recoveryStatus: ["invalid", "unavailable"].includes(persisted.status) ? persisted.status : null,
    };
  }
  if (initialTrip === null) return { activeTrip: null, sampleMode: false, recoveryStatus: null };
  try {
    return { activeTrip: parseCanonicalTrip(initialTrip), sampleMode: false, recoveryStatus: null };
  } catch {
    return { activeTrip: null, sampleMode: false, recoveryStatus: "invalid" };
  }
}

export function TripRuntimeApp({ initialTrip, sampleTrip = osakaSampleTrip }) {
  const [appState, setAppState] = useState(() => initialAppState(initialTrip));
  const { activeTrip, sampleMode, recoveryStatus } = appState;
  const showConfirmedTrip = (trip) => setAppState({ activeTrip: trip, sampleMode: false, recoveryStatus: null });

  return (
    <ThemeProvider theme={appTheme}>
      {activeTrip ? (
        <TripViewer
          key={`${sampleMode ? "sample" : "confirmed"}:${activeTrip.id}`}
          canonicalTrip={activeTrip}
          sampleMode={sampleMode}
          onTripConfirmed={showConfirmedTrip}
          onTripImported={showConfirmedTrip}
          onTripCleared={() => setAppState({ activeTrip: null, sampleMode: false, recoveryStatus: null })}
          onExitSample={() => {
            setAppState({ activeTrip: null, sampleMode: false, recoveryStatus: null });
          }}
        />
      ) : (
        <TripHome
          recoveryStatus={recoveryStatus}
          onTripConfirmed={showConfirmedTrip}
          onTripImported={showConfirmedTrip}
          onOpenSample={() => setAppState({ activeTrip: sampleTrip, sampleMode: true, recoveryStatus: null })}
        />
      )}
    </ThemeProvider>
  );
}
