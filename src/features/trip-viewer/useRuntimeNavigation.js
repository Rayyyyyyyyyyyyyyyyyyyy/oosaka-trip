import { useEffect, useMemo, useState } from "react";
import { getSafeTripRuntime } from "../../domain/trip/runtime";

export function useRuntimeNavigation(canonicalTrip, days) {
  const [runtime, setRuntime] = useState(() => getSafeTripRuntime(canonicalTrip));
  const [view, setView] = useState(() => runtime.available && runtime.phase === "during" ? "today" : "overview");
  const [date, setDate] = useState(() => runtime.available && runtime.phase === "during" ? runtime.date : days[0].date);

  useEffect(() => {
    const refreshRuntime = () => {
      const nextRuntime = getSafeTripRuntime(canonicalTrip);
      setRuntime(nextRuntime);
      if (view === "today" && nextRuntime.available && nextRuntime.phase === "during") setDate(nextRuntime.date);
    };
    refreshRuntime();
    const timer = window.setInterval(refreshRuntime, 60000);
    return () => window.clearInterval(timer);
  }, [canonicalTrip, view]);

  const day = useMemo(() => days.find((candidate) => candidate.date === date) || days[0], [date, days]);
  const selectDay = (nextDate) => { setDate(nextDate); setView("day"); };
  const selectView = (nextView) => {
    if (nextView === "today" && runtime.available && runtime.phase === "during") setDate(runtime.date);
    setView(nextView);
  };
  return { runtime, view, date, day, selectDay, selectView, showFullDay: () => setView("day") };
}
