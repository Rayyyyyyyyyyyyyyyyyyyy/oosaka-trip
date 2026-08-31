import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { Attractions, CheckCircle, Coffee, Directions, EventNote, Flight, Hotel, Restaurant, Train, Work } from "@mui/icons-material";

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
    <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "background.default", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
      <Icon sx={{ fontSize: 18, color: "primary.main" }} />
    </Box>
  );
}

export function EventCard({ event }) {
  if (event.transit) {
    return (
      <Stack direction="row" spacing={1.5} sx={{ ml: 2, py: 1.5, borderLeft: "1px dashed", borderColor: "text.secondary", pl: 3 }}>
        <Train fontSize="small" color="disabled" />
        <Typography variant="caption" color="text.secondary">
          <b>{event.transit}</b>
          {(event.from || event.to) && ` · ${[event.from, event.to].filter(Boolean).join(" → ")}`}
          {event.tip && ` · ${event.tip}`}
        </Typography>
      </Stack>
    );
  }
  return (
    <Paper component="article" sx={{ p: 2.5, borderTop: 1, borderColor: "divider", transition: "background-color 200ms", "&:hover": { bgcolor: "rgba(255,255,255,.6)" } }}>
      <Stack direction="row" spacing={2}>
        <Typography width={50} flexShrink={0} fontFamily="ui-monospace" fontSize={11} color="text.secondary" pt={1}>
          {event.time}
        </Typography>
        <EventIcon type={event.type} />
        <Box flex={1} minWidth={0}>
          <Typography variant="h3" fontSize={19}>{event.title}</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>{event.meta}</Typography>
          {event.status && <Chip icon={<CheckCircle />} label={event.status} color="success" size="small" sx={{ mt: 1.5 }} />}
          {event.flexible && <Chip label="FLEXIBLE" variant="outlined" size="small" sx={{ mt: 1.5, ml: event.status ? 1 : 0 }} />}
          {event.relation && (
            <Chip label={`${event.relation.kind.toUpperCase()} · ${event.relation.groupId}`} variant="outlined" color={event.relation.kind === "fallback" ? "warning" : "default"} size="small" sx={{ mt: 1.5, ml: event.status || event.flexible ? 1 : 0 }} />
          )}
          {event.note && (
            <Typography sx={{ mt: 2, pl: 1.5, borderLeft: 3, borderColor: "var(--trip-color-acid)", fontFamily: '"Noto Serif TC",serif', fontWeight: 700 }}>
              「{event.note}」
            </Typography>
          )}
          <Stack direction="row" spacing={1} mt={1.5}>
            {event.map && (
              <Button size="small" startIcon={<Directions />} href={mapHref(event.map)} target="_blank" rel="noreferrer">
                {event.mapIsFallback ? "Search Maps · unresolved" : "Directions"}
              </Button>
            )}
            {event.tabelog && <Button size="small" color="secondary" href={event.tabelog} target="_blank" rel="noreferrer">食べログ</Button>}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
