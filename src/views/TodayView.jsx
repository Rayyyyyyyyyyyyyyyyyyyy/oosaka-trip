import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Directions } from "@mui/icons-material";
import { EventIcon } from "../components/EventIcon";
import { mapHref } from "../lib/tripRuntime";
import { DayView } from "./DayView";

export function TodayView({ day, onFullDay, runtime }) {
  if (day.date !== "2026-09-12")
    return (
      <>
        <Typography variant="overline" color="secondary">
          TODAY · {String(Math.floor(runtime.minutes / 60)).padStart(2, "0")}:
          {String(runtime.minutes % 60).padStart(2, "0")} JST
        </Typography>
        <Typography color="text.secondary" variant="body2" mt={1} mb={4}>
          此日沒有足夠精確的時間資料，因此不顯示推測的 NOW。
        </Typography>
        <DayView day={day} />
      </>
    );

  const titledEvents = day.events.filter((event) => event.title);
  let current = titledEvents[0];
  let next = titledEvents[1];

  if (runtime.minutes < 10 * 60 + 30) {
    current = null;
    next = titledEvents[0];
  } else if (runtime.minutes < 19 * 60 + 30) {
    current = titledEvents[1];
    next = titledEvents[2];
  } else {
    current = titledEvents[2];
    next = null;
  }

  return (
    <>
      <Typography variant="overline" color="secondary">
        TODAY · {day.dow} · SEP {day.n}
      </Typography>
      <Typography variant="h1" fontSize={{ xs: 38, md: 56 }} mt={1}>
        {day.title}
      </Typography>
      <Typography color="text.secondary" mt={1}>
        {day.subtitle}
      </Typography>
      <Paper
        className="mt-10 border-y border-trip-ink bg-trip-surface p-5 md:p-8"
        sx={{
          mt: 5,
          p: { xs: 2.5, md: 4 },
          borderTop: 1,
          borderBottom: 1,
          borderColor: "text.primary",
        }}
      >
        <Typography variant="overline" color="secondary">
          {current ? "NOW" : "TODAY"}
        </Typography>
        <Stack direction="row" spacing={2} mt={1.5}>
          <EventIcon type={current?.type || "transport"} />
          <Box>
            <Typography variant="h2" fontSize={25}>
              {current?.title || "尚未開始今天的行程"}
            </Typography>
            <Typography color="text.secondary" variant="body2" mt={0.5}>
              {current?.meta}
            </Typography>
            {current?.note && (
              <Typography
                mt={2}
                fontFamily='"Noto Serif TC",serif'
                fontWeight={700}
              >
                「{current.note}」
              </Typography>
            )}
          </Box>
        </Stack>
        {next && (
          <>
            <Divider sx={{ my: 3, borderStyle: "dashed" }} />
            <Typography variant="overline" color="secondary">
              NEXT
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              mt={1.5}
              alignItems={{ sm: "center" }}
            >
              <Typography fontFamily="ui-monospace" fontWeight={700}>
                {next.time}
              </Typography>
              <Box flex={1}>
                <Typography variant="h3" fontSize={20}>
                  {next.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {next.meta}
                </Typography>
                {next.status && (
                  <Chip
                    size="small"
                    color="success"
                    label={`✓ ${next.status}`}
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
              {day.leaveBy && (
                <Paper
                  sx={{
                    p: 1.5,
                    bgcolor: "text.primary",
                    color: "white",
                    textAlign: "right",
                  }}
                >
                  <Typography variant="overline" fontSize={9}>
                    LEAVE BEFORE
                  </Typography>
                  <Typography
                    color="#d9ef6f"
                    fontFamily="ui-monospace"
                    fontWeight={700}
                  >
                    {day.leaveBy}
                  </Typography>
                </Paper>
              )}
            </Stack>
          </>
        )}
        <Stack direction="row" spacing={1} mt={3}>
          {next?.map && (
            <Button
              variant="contained"
              startIcon={<Directions />}
              href={mapHref(next.map)}
              target="_blank"
            >
              Directions
            </Button>
          )}
          <Button onClick={onFullDay}>View full day</Button>
        </Stack>
      </Paper>
    </>
  );
}
