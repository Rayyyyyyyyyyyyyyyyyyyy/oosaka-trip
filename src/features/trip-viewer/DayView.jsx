import { Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { Map } from "@mui/icons-material";
import { EventCard, EventIcon } from "./EventPresentation";

export function DayView({ day }) {
  return (
    <>
      <Typography variant="overline" color="secondary">{day.dow} · {day.month} {day.n}</Typography>
      <Typography variant="h1" fontSize={{ xs: 38, md: 56 }} mt={1}>{day.title}</Typography>
      <Typography color="text.secondary" mt={1}>{day.subtitle}</Typography>
      {day.special ? (
        <Paper sx={{ my: 5, p: { xs: 4, md: 8 }, textAlign: "center", borderTop: 1, borderBottom: 1, borderColor: "text.primary" }}>
          <EventIcon type={day.events[0].type} />
          <Typography variant="overline" display="block" color="secondary" mt={2}>{day.events[0].time}</Typography>
          <Typography variant="h2" fontSize={{ xs: 32, md: 48 }} my={3}>{day.events[0].title}</Typography>
          {day.events[0].meta && <Typography>{day.events[0].meta}</Typography>}
          {day.events[0].map && <Button sx={{ mt: 2 }} startIcon={<Map />} href={day.events[0].map} target="_blank" rel="noreferrer">{day.events[0].mapIsFallback ? "Search Maps · unresolved" : "Open map"}</Button>}
        </Paper>
      ) : (
        <Stack mt={5}>{day.events.map((event) => <EventCard key={event.id} event={event} />)}</Stack>
      )}
      {day.optional.length > 0 && (
        <Paper sx={{ mt: 4, p: 3, bgcolor: "var(--trip-color-soft)" }}>
          <Typography variant="overline" color="text.secondary">IF YOU STILL HAVE ENERGY</Typography>
          <Stack direction="row" gap={1} flexWrap="wrap" mt={2}>
            {day.optional.map((place) => <Chip key={place.id} icon={<Map />} label={place.name} variant="outlined" component="a" href={place.map} target="_blank" rel="noreferrer" clickable />)}
          </Stack>
        </Paper>
      )}
    </>
  );
}
