import { osakaTrip } from "./osakaTrip";

function copyTrip(id) {
  const trip = structuredClone(osakaTrip);
  trip.id = id;
  return trip;
}

const missingAnchors = copyTrip("viewer-missing-anchors");
missingAnchors.days.forEach((day) => {
  day.items = day.items.filter(
    (item) => item.kind !== "event" || !["flight", "hotel"].includes(item.type),
  );
});

const noFixedAnchor = copyTrip("viewer-no-fixed-anchor");
noFixedAnchor.days[2].items = noFixedAnchor.days[2].items.filter(
  (item) => item.kind !== "event" || item.id !== "event-seijiro",
);

const approximateOpenEnded = copyTrip("viewer-approximate-open-ended");
approximateOpenEnded.days[5].items.unshift({
  id: "event-airport-breakfast",
  kind: "event",
  type: "restaurant",
  title: "Airport breakfast",
  timing: { kind: "open_ended", start: "08:30", label: "08:30~" },
  links: [],
});

const alternativeConditional = copyTrip("viewer-alternative-conditional");
alternativeConditional.days[1].items[2].relation = {
  kind: "conditional",
  groupId: "museum-weather-plan",
  condition: "Only if the booking time is confirmed",
};
alternativeConditional.days[1].items[4].relation = {
  kind: "alternative",
  groupId: "dinner-choice",
};

export const viewerSemanticTrips = {
  osakaOverview: osakaTrip,
  flexibleHeavy: osakaTrip,
  missingAnchors,
  noFixedAnchor,
  optionalHeavy: osakaTrip,
  reservationHeavy: osakaTrip,
  allDay: osakaTrip,
  approximateOpenEnded,
  alternativeConditional,
};
