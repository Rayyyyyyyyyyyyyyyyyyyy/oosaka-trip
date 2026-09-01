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

const timingSemantics = {
  exact: "FIXED TIME",
  range: "TIME WINDOW",
  open_ended: "OPEN ENDED",
  approximate: "APPROXIMATE",
  part_of_day: "PART OF DAY",
  all_day: "ALL DAY",
  unspecified: "TIME UNRESOLVED",
};

function uniqueLabels(labels) {
  return [...new Set(labels.map((label) => label?.trim()).filter(Boolean))];
}

export function selectJourneyLabels(trip) {
  const destinations = trip.destination.split(/[・·,、/→]/u);
  const supportedPlaceCodes = trip.days
    .map((day) => day.theme)
    .filter((theme) => /^[A-Z][A-Z0-9&-]{1,7}$/.test(theme ?? ""));
  return uniqueLabels([...destinations, ...supportedPlaceCodes]);
}

export function selectReadinessAttention(reservations, todos) {
  const todoState = new Map(todos.map((todo) => [todo.id, todo.done]));
  const reservation = reservations.find(
    (item) => todoState.get(item.todoId) === false,
  );
  if (reservation) {
    return {
      id: reservation.id,
      todoId: reservation.todoId,
      title: reservation.title,
      status: reservation.pendingStatus || "Action needed",
      type: reservation.type,
    };
  }
  const todo = todos.find((item) => !item.done);
  return todo
    ? {
        id: todo.id,
        todoId: todo.id,
        title: todo.label,
        status: "Action needed",
      }
    : null;
}

function isFixedAnchor(event) {
  if (event.kind !== "event" || event.optional || event.flexible) return false;
  return (
    ["exact", "all_day"].includes(event.timing.kind) || Boolean(event.status)
  );
}

export function selectNearestFixedAnchor(day) {
  const event = day.items.find(isFixedAnchor);
  if (!event) return null;
  return {
    eventId: event.id,
    time: timingLabel(event.timing),
    timingKind: event.timing.kind,
    title: event.title,
    status: event.status,
    type: event.type,
  };
}

function linkOf(event, type) {
  return event.links.find((link) => link.type === type)?.url;
}

function mapsSearch(place) {
  return place
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`
    : undefined;
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
        id: event.id,
        code: event.flight.code ?? "Flight",
        date: monthDay(day.date),
        route:
          [
            [event.flight.origin, event.flight.departure]
              .filter(Boolean)
              .join(" "),
            [event.flight.destination, event.flight.arrival]
              .filter(Boolean)
              .join(" "),
          ]
            .filter(Boolean)
            .join(" → ") || "Details unresolved",
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
  const exactMap = linkOf(event, "maps");
  const fixed = isFixedAnchor(event);
  return {
    id: event.id,
    time: timingLabel(event.timing),
    type: event.type,
    title: event.title,
    meta: event.details,
    note: event.note,
    status: event.status,
    flexible: Boolean(event.flexible),
    relation: event.relation,
    map: exactMap ?? mapsSearch(event.place),
    mapIsFallback: !exactMap && Boolean(event.place),
    tabelog: linkOf(event, "restaurant"),
    timing: event.timing,
    semantic: {
      timing: timingSemantics[event.timing.kind],
      fixed,
      approximate: event.timing.kind === "approximate",
      openEnded: event.timing.kind === "open_ended",
      allDay: event.timing.kind === "all_day",
      untimed: ["part_of_day", "unspecified"].includes(event.timing.kind),
      unresolved: event.timing.kind === "unspecified",
      flexible: Boolean(event.flexible),
      tentative: Boolean(event.tentative),
      relation: event.relation?.kind,
    },
  };
}

export function selectDays(trip) {
  return trip.days.map((day, index) => {
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
      month: displayDate.format(date).split(" ")[0].toUpperCase(),
      dow: displayWeekday.format(date).toUpperCase(),
      label: day.theme || day.title,
      title: day.title,
      subtitle: day.subtitle,
      suggestedDeparture: day.suggestedDeparture?.label,
      sequence: index + 1,
      totalDays: trip.days.length,
      fixedAnchor: selectNearestFixedAnchor(day),
      atmosphere: {
        label: day.theme || day.title,
        flexible: primaryEvents.some((event) => event.flexible),
        movement: timelineItems.some(
          (item) =>
            item.kind === "transit" ||
            (item.kind === "event" && item.type === "transport"),
        ),
      },
      special:
        primaryEvents.length === 1 &&
        primaryEvents[0].timing.kind === "all_day",
      events: timelineItems.map((item) =>
        item.kind === "transit"
          ? {
              id: item.id,
              transit: item.label,
              tip: item.tip,
              from: item.from,
              to: item.to,
            }
          : selectEvent(item),
      ),
      optional: optionalItems.map((event) => ({
        id: event.id,
        name: event.title,
        map: linkOf(event, "maps") ?? mapsSearch(event.place),
        mapIsFallback: !linkOf(event, "maps") && Boolean(event.place),
      })),
      canonicalDay: day,
    };
  });
}

export function selectReservations(trip) {
  return trip.reservations.map((reservation) => ({
    id: reservation.id,
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
      destination: trip.destination,
      journeyLabels: selectJourneyLabels(trip),
      hotel: selectHotel(trip),
      stay: selectStay(trip),
      flights: selectFlights(trip),
    },
    days: selectDays(trip),
    reservations: selectReservations(trip),
    initialTodos: selectInitialTodos(trip),
  };
}
