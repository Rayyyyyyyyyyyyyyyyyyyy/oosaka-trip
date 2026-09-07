import {
  Box,
  Divider,
  List,
  ListItemButton,
  Stack,
  Typography,
} from "@mui/material";
import { days, trip } from "../data/tripData";

export function Overview({ onDay }) {
  return (
    <>
      <Typography variant="overline" color="secondary">
        YOUR TRIP · 6 DAYS
      </Typography>
      <Typography variant="h1" fontSize={{ xs: 43, md: 68 }} mt={1}>
        {trip.title}
      </Typography>
      <Stack divider={<Divider />} mt={5}>
        <Box py={3}>
          <Typography variant="overline" color="secondary">
            FLIGHTS
          </Typography>
          {trip.flights.map((flight) => (
            <Stack
              key={flight.code}
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              mt={2}
            >
              <Typography width={70} fontFamily="ui-monospace">
                {flight.code}
              </Typography>
              <Box>
                <Typography fontFamily="ui-monospace" fontWeight={700}>
                  {flight.route}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {flight.date}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Box>
        <Box py={3}>
          <Typography variant="overline" color="secondary">
            STAY
          </Typography>
          <Typography variant="h3" fontSize={20} mt={2}>
            Aloft Osaka Dojima
          </Typography>
          <Typography variant="caption" color="text.secondary">
            SEP 10 → SEP 15 · DOJIMA, OSAKA
          </Typography>
        </Box>
        <Box py={3}>
          <Typography variant="overline" color="secondary">
            ITINERARY
          </Typography>
          <List disablePadding sx={{ mt: 1 }}>
            {days.map((day) => (
              <ListItemButton
                key={day.date}
                onClick={() => onDay(day.date)}
                sx={{ px: 0, borderBottom: 1, borderColor: "divider" }}
              >
                <Typography
                  width={50}
                  fontFamily="ui-monospace"
                  fontWeight={700}
                >
                  {day.n}
                </Typography>
                <Typography
                  width={50}
                  fontFamily="ui-monospace"
                  fontSize={10}
                  color="text.secondary"
                >
                  {day.dow}
                </Typography>
                <Typography>
                  {day.title} · {day.subtitle}
                </Typography>
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Stack>
    </>
  );
}
