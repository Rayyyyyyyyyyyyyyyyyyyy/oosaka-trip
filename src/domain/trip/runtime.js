const formatterCache = new Map();

function formatterFor(timezone) {
  if (!formatterCache.has(timezone)) {
    formatterCache.set(
      timezone,
      new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }),
    );
  }
  return formatterCache.get(timezone);
}

export function getTripRuntime(trip, now = new Date()) {
  const parts = Object.fromEntries(
    formatterFor(trip.timezone)
      .formatToParts(now)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const phase = date < trip.startDate ? "before" : date > trip.endDate ? "after" : "during";
  return { date, minutes, phase };
}

export function minutesUntilTrip(trip, runtime) {
  const start = new Date(`${trip.startDate}T00:00:00+09:00`);
  const current = new Date(`${runtime.date}T00:00:00+09:00`);
  return Math.max(0, Math.ceil((start - current) / 86400000));
}

function toMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function selectRuntimeCandidates(day, runtimeMinutes) {
  const exactEvents = day.items.filter(
    (item) => item.kind === "event" && item.timing.kind === "exact",
  );
  const current = exactEvents.find((event) => {
    if (!event.timing.end) return false;
    return toMinutes(event.timing.start) <= runtimeMinutes && runtimeMinutes < toMinutes(event.timing.end);
  }) ?? null;
  const next = exactEvents
    .filter((event) => toMinutes(event.timing.start) > runtimeMinutes)
    .sort((left, right) => toMinutes(left.timing.start) - toMinutes(right.timing.start))[0] ?? null;
  return { current, next };
}

function supportedStart(item) {
  return ["exact", "range", "open_ended"].includes(item.timing?.kind)
    ? item.timing.start
    : null;
}

export function selectNextConfirmedEvent(trip, runtime) {
  return trip.days
    .flatMap((day) => day.items
      .filter((item) => item.kind === "event" && !item.optional && !item.tentative && supportedStart(item))
      .map((event) => ({ date: day.date, event })))
    .filter(({ date, event }) => date > runtime.date || (date === runtime.date && toMinutes(supportedStart(event)) > runtime.minutes))
    .sort((left, right) => left.date.localeCompare(right.date) || toMinutes(supportedStart(left.event)) - toMinutes(supportedStart(right.event)))[0] ?? null;
}
