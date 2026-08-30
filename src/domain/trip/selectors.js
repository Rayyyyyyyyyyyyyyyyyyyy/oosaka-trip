const displayDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const displayWeekday = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "UTC",
});

function asUtcDate(date) {
  return new Date(`${date}T00:00:00Z`);
}

function monthDay(date) {
  return displayDate.format(asUtcDate(date)).toUpperCase();
}

function timingLabel(timing) {
  if (timing.label) return timing.label;
  if (timing.kind === "exact") return timing.start;
  return "Flexible";
}

function linkOf(event, type) {
  return event.links.find((link) => link.type === type)?.url;
}

export function selectTripHeader(trip) {
  const days = trip.days.length;
  return {
    title: trip.title,
    period: `${monthDay(trip.startDate)} — ${monthDay(trip.endDate)}`,
    days,
    countryCode: trip.countryCode,
    year: trip.startDate.slice(0, 4),
  };
}

export function selectFlights(trip) {
  return trip.days.flatMap((day) =>
    day.items
      .filter((item) => item.kind === "event" && item.flight)
      .map((event) => ({
        code: event.flight.code,
        date: monthDay(day.date),
        route: `${event.flight.origin} ${event.flight.departure} → ${event.flight.destination} ${event.flight.arrival}`,
      })),
  );
}

export function selectHotel(trip) {
  const hotel = trip.days
    .flatMap((day) => day.items)
    .find((item) => item.kind === "event" && item.type === "hotel");
  return hotel?.title ?? null;
}

export function selectStay(trip) {
  const hotel = trip.days
    .flatMap((day) => day.items)
    .find((item) => item.kind === "event" && item.type === "hotel");
  if (!hotel) return null;
  return {
    title: hotel.title,
    period: `${monthDay(trip.startDate)} → ${monthDay(trip.endDate)}`,
    details: hotel.details,
  };
}

function selectEvent(event) {
  return {
    id: event.id,
    time: timingLabel(event.timing),
    type: event.type,
    title: event.title,
    meta: event.details,
    note: event.note,
    status: event.status,
    flexible: Boolean(event.flexible),
    map: linkOf(event, "maps"),
    tabelog: linkOf(event, "restaurant"),
    timing: event.timing,
  };
}

export function selectDays(trip) {
  return trip.days.map((day) => {
    const date = asUtcDate(day.date);
    const timelineItems = day.items.filter(
      (item) => item.kind === "transit" || !item.optional,
    );
    const optionalItems = day.items.filter(
      (item) => item.kind === "event" && item.optional,
    );
    const primaryEvents = timelineItems.filter((item) => item.kind === "event");
    return {
      id: day.id,
      date: day.date,
      n: String(date.getUTCDate()),
      dow: displayWeekday.format(date).toUpperCase(),
      label: day.theme || day.title,
      title: day.title,
      subtitle: day.subtitle,
      suggestedDeparture: day.suggestedDeparture?.label,
      special:
        primaryEvents.length === 1 && primaryEvents[0].timing.kind === "all_day",
      events: timelineItems.map((item) =>
        item.kind === "transit"
          ? { id: item.id, transit: item.label, tip: item.tip }
          : selectEvent(item),
      ),
      optional: optionalItems.map((event) => ({
        id: event.id,
        name: event.title,
        map: linkOf(event, "maps"),
      })),
      canonicalDay: day,
    };
  });
}

export function selectReservations(trip) {
  return trip.reservations.map((reservation) => ({
    date: reservation.dateLabel,
    type: reservation.type,
    title: reservation.title,
    todoId: reservation.todoId,
    completeStatus: reservation.completeStatus,
    pendingStatus: reservation.pendingStatus,
  }));
}

export function selectInitialTodos(trip) {
  return trip.todos.map((todo) => ({
    id: todo.id,
    label: todo.label,
    done: todo.defaultDone,
  }));
}

export function selectViewerModel(trip) {
  return {
    trip: {
      ...selectTripHeader(trip),
      hotel: selectHotel(trip),
      stay: selectStay(trip),
      flights: selectFlights(trip),
    },
    days: selectDays(trip),
    reservations: selectReservations(trip),
    initialTodos: selectInitialTodos(trip),
  };
}
