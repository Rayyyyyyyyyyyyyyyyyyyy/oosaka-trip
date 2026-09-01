import { Box, Button, Chip, Typography } from "@mui/material";
import {
  Attractions,
  CheckCircle,
  Coffee,
  Directions,
  EventNote,
  Flight,
  Hotel,
  Restaurant,
  Train,
  Work,
} from "@mui/icons-material";

const icons = {
  flight: Flight,
  hotel: Hotel,
  work: Work,
  activity: Attractions,
  restaurant: Restaurant,
  transport: Train,
  free_time: Coffee,
};

export function mapHref(place) {
  if (place?.startsWith("https://")) return place;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
}

export function EventIcon({ type }) {
  const Icon = icons[type] || EventNote;
  return (
    <div className="grid h-[34px] w-[34px] flex-none place-items-center rounded-full bg-[color-mix(in_srgb,var(--trip-color-movement)_12%,var(--trip-color-surface))]">
      <Icon className="!text-lg !text-trip-movement" />
    </div>
  );
}

function semanticSurface(event) {
  if (event.semantic?.allDay)
    return "color-mix(in srgb, var(--trip-color-movement) 12%, var(--trip-color-surface))";
  if (event.semantic?.fixed)
    return "color-mix(in srgb, var(--trip-color-attention) 8%, var(--trip-color-surface))";
  if (event.semantic?.flexible)
    return "color-mix(in srgb, var(--trip-color-readiness) 10%, var(--trip-color-surface))";
  return "transparent";
}

function semanticBorder(event) {
  if (event.semantic?.fixed) return "var(--trip-color-attention)";
  if (event.semantic?.flexible) return "var(--trip-color-readiness)";
  if (event.semantic?.unresolved) return "var(--trip-color-muted)";
  return "transparent";
}

export function EventCard({ event }) {
  if (event.transit) {
    return (
      <div
        role="note"
        aria-label={`Transit: ${event.transit}`}
        className="ml-[52px] flex gap-3 border-l border-dashed border-trip-movement py-3.5 pl-5 sm:ml-[68px]"
      >
        <Train className="!text-[17px] !text-trip-movement" />
        <Typography variant="caption" color="text.secondary">
          <Box component="span" fontWeight={800}>
            {event.transit}
          </Box>
          {(event.from || event.to) &&
            ` · ${[event.from, event.to].filter(Boolean).join(" → ")}`}
          {event.tip && ` · ${event.tip}`}
        </Typography>
      </div>
    );
  }

  const relationLabel = event.semantic?.relation?.toUpperCase();
  return (
    <Box
      component="article"
      id={`event-${event.id}`}
      data-event-id={event.id}
      data-timing-kind={event.timing.kind}
      className={`scroll-mt-[118px] border-t border-l-4 px-3 sm:px-5 ${
        event.semantic?.allDay ? "py-8 md:py-10" : "py-[22px]"
      }`}
      sx={{
        borderTopStyle: event.semantic?.unresolved ? "dashed" : "solid",
        borderColor: "var(--trip-color-hairline)",
        borderLeftColor: semanticBorder(event),
        bgcolor: semanticSurface(event),
      }}
    >
      <div className="flex items-start gap-2.5 sm:gap-4">
        <div className="w-12 shrink-0 pt-1.5 sm:w-[62px]">
          <Typography
            className={`!font-utility !text-[11px] !font-extrabold ${
              event.semantic?.fixed
                ? "!text-trip-attention"
                : "!text-trip-muted"
            }`}
          >
            {event.time}
          </Typography>
        </div>
        <EventIcon type={event.type} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <Typography
              variant="h3"
              className={`!basis-[180px] !grow ${
                event.semantic?.allDay
                  ? "!text-[25px] md:!text-[30px]"
                  : "!text-[19px]"
              }`}
            >
              {event.title}
            </Typography>
            <Typography
              variant="overline"
              color="text.secondary"
              className="whitespace-nowrap"
            >
              {event.semantic?.timing}
            </Typography>
          </div>
          {event.meta && (
            <Typography
              variant="body2"
              color="text.secondary"
              className="!mt-1.5"
            >
              {event.meta}
            </Typography>
          )}
          <div
            className={`flex flex-wrap gap-1.5 ${
              event.status ||
              event.semantic?.flexible ||
              relationLabel ||
              event.semantic?.tentative
                ? "mt-3"
                : ""
            }`}
          >
            {event.status && (
              <Chip
                icon={<CheckCircle />}
                label={event.status}
                color="success"
                size="small"
              />
            )}
            {event.semantic?.flexible && (
              <Chip
                label="FLEXIBLE"
                variant="outlined"
                size="small"
                sx={{
                  color: "var(--trip-color-readiness)",
                  borderColor: "var(--trip-color-readiness)",
                }}
              />
            )}
            {event.semantic?.tentative && (
              <Chip label="TENTATIVE" variant="outlined" size="small" />
            )}
            {relationLabel && (
              <Chip
                label={relationLabel}
                variant="outlined"
                color={
                  event.semantic.relation === "fallback" ? "warning" : "default"
                }
                size="small"
              />
            )}
          </div>
          {event.relation?.condition && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              className="!mt-2"
            >
              {event.relation.condition}
            </Typography>
          )}
          {event.note && (
            <Typography className="!mt-4 !border-l-[3px] !border-trip-warmth !pl-3 !font-serif-jp !font-bold">
              「{event.note}」
            </Typography>
          )}
          <div
            className={`flex flex-wrap gap-2 ${event.map || event.tabelog ? "mt-3" : ""}`}
          >
            {event.map && (
              <Button
                size="small"
                startIcon={<Directions />}
                href={mapHref(event.map)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {event.mapIsFallback
                  ? "Search Maps · unresolved"
                  : "Directions"}
              </Button>
            )}
            {event.tabelog && (
              <Button
                size="small"
                color="secondary"
                href={event.tabelog}
                target="_blank"
                rel="noopener noreferrer"
              >
                食べログ
              </Button>
            )}
          </div>
        </div>
      </div>
    </Box>
  );
}
