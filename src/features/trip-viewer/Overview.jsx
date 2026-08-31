import { Box, Divider, List, ListItemButton, Stack, Typography } from "@mui/material";
import { useViewerData } from "./viewerContext";

export function Overview({ onDay }) {
  const { trip, days } = useViewerData();
  return (
    <>
      <Typography variant="overline" color="secondary">YOUR TRIP · {trip.days} {trip.days === 1 ? "DAY" : "DAYS"}</Typography>
      <Typography variant="h1" fontSize={{ xs: 43, md: 68 }} mt={1}>{trip.title}</Typography>
      <Stack divider={<Divider />} mt={5}>
        {trip.flights.length > 0 && <Box py={3}><Typography variant="overline" color="secondary">FLIGHTS</Typography>{trip.flights.map((flight) => <Stack key={flight.id} direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}><Typography width={70} fontFamily="ui-monospace">{flight.code}</Typography><Box><Typography fontFamily="ui-monospace" fontWeight={700}>{flight.route}</Typography><Typography variant="caption" color="text.secondary">{flight.date}</Typography></Box></Stack>)}</Box>}
        {trip.stay && <Box py={3}><Typography variant="overline" color="secondary">STAY</Typography><Typography variant="h3" fontSize={20} mt={2}>{trip.stay.title}</Typography><Typography variant="caption" color="text.secondary">{trip.stay.period} · {trip.stay.details}</Typography></Box>}
        <Box py={3}><Typography variant="overline" color="secondary">ITINERARY</Typography><List disablePadding sx={{ mt: 1 }}>{days.map((day) => <ListItemButton key={day.id} onClick={() => onDay(day.date)} sx={{ px: 0, borderBottom: 1, borderColor: "divider" }}><Typography width={50} fontFamily="ui-monospace" fontWeight={700}>{day.n}</Typography><Typography width={50} fontFamily="ui-monospace" fontSize={10} color="text.secondary">{day.dow}</Typography><Typography>{day.title}{day.subtitle ? ` · ${day.subtitle}` : ""}</Typography></ListItemButton>)}</List></Box>
      </Stack>
    </>
  );
}
