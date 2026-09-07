import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { days, trip } from "../data/tripData";
import { EventIcon } from "../components/EventIcon";

export function TripStatusView({ runtime }) {
  if (runtime.phase === "after")
    return (
      <Paper className="border-y border-trip-ink bg-trip-surface p-8 text-center md:p-14">
        <Typography variant="overline" color="secondary">
          TRIP COMPLETED
        </Typography>
        <Typography variant="h1" fontSize={{ xs: 38, md: 56 }} mt={2}>
          {trip.title}
        </Typography>
        <Typography color="text.secondary" mt={2}>
          旅程已結束，完整行程仍可從 Day 查看。
        </Typography>
      </Paper>
    );

  const start = new Date(`${days[0].date}T00:00:00+09:00`);
  const today = new Date(`${runtime.date}T00:00:00+09:00`);
  const daysToGo = Math.max(0, Math.ceil((start - today) / 86400000));
  return (
    <Paper className="border-y border-trip-ink bg-trip-surface p-6 md:p-10">
      <Typography variant="overline" color="secondary">
        UP NEXT
      </Typography>
      <Typography variant="h1" fontSize={{ xs: 38, md: 56 }} mt={1}>
        {daysToGo} days to go
      </Typography>
      <Typography color="text.secondary" mt={1}>
        目前日本日期：{runtime.date}
      </Typography>
      <Divider sx={{ my: 3 }} />
      <Stack direction="row" spacing={2} alignItems="center">
        <EventIcon type="flight" />
        <Box>
          <Typography variant="h3" fontSize={20}>
            JX822 · SEP 10
          </Typography>
          <Typography color="text.secondary" variant="body2">
            TPE 10:15 → KIX 14:00
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
