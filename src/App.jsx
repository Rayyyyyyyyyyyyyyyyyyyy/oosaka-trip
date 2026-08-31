import { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { appTheme } from "./appTheme";
import { TripHome } from "./features/trip-import/TripHome";
import { TripViewer } from "./features/trip-viewer/TripViewer";
import { osakaSampleTrip, persistedCanonicalTrip } from "./tripData";

export function TripRuntimeApp({ initialTrip = persistedCanonicalTrip, sampleTrip = osakaSampleTrip }) {
  const [activeTrip, setActiveTrip] = useState(() => initialTrip);
  const [sampleMode, setSampleMode] = useState(false);

  return (
    <ThemeProvider theme={appTheme}>
      {activeTrip ? (
        <TripViewer
          canonicalTrip={activeTrip}
          sampleMode={sampleMode}
          onExitSample={() => {
            setSampleMode(false);
            setActiveTrip(null);
          }}
        />
      ) : (
        <TripHome onOpenSample={() => {
          setSampleMode(true);
          setActiveTrip(sampleTrip);
        }} />
      )}
    </ThemeProvider>
  );
}
