import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { CheckCircle, Directions, Train } from "@mui/icons-material";
import { mapHref } from "../lib/tripRuntime";
import { EventIcon } from "./EventIcon";

export function EventCard({ event }) {
  if (event.transit)
    return (
      <Stack
        className="ml-4 border-l border-dashed border-trip-muted/70 py-1.5 pl-6"
        direction="row"
        spacing={1.5}
        sx={{
          ml: 2,
          py: 1.5,
          borderLeft: "1px dashed",
          borderColor: "text.secondary",
          pl: 3,
        }}
      >
        <Train fontSize="small" color="disabled" />
        <Typography variant="caption" color="text.secondary">
          <b>{event.transit}</b>
          {event.tip && ` · ${event.tip}`}
        </Typography>
      </Stack>
    );

  return (
    <Paper
      className="border-t border-black/10 transition-colors duration-200 hover:bg-white/60"
      component="article"
      sx={{ p: 2.5, borderTop: 1, borderColor: "divider" }}
    >
      <Stack direction="row" spacing={2}>
        <Typography
          width={50}
          flexShrink={0}
          fontFamily="ui-monospace"
          fontSize={11}
          color="text.secondary"
          pt={1}
        >
          {event.time}
        </Typography>
        <EventIcon type={event.type} />
        <Box flex={1} minWidth={0}>
          <Typography variant="h3" fontSize={19}>
            {event.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {event.meta}
          </Typography>
          {event.status && (
            <Chip
              icon={<CheckCircle />}
              label={event.status}
              color="success"
              size="small"
              sx={{ mt: 1.5 }}
            />
          )}
          {event.flexible && (
            <Chip
              label="FLEXIBLE"
              variant="outlined"
              size="small"
              sx={{ mt: 1.5, ml: event.status ? 1 : 0 }}
            />
          )}
          {event.note && (
            <Typography
              sx={{
                mt: 2,
                pl: 1.5,
                borderLeft: 3,
                borderColor: "#d9ef6f",
                fontFamily: '"Noto Serif TC",serif',
                fontWeight: 700,
              }}
            >
              「{event.note}」
            </Typography>
          )}
          <Stack direction="row" spacing={1} mt={1.5}>
            {event.map && (
              <Button
                size="small"
                startIcon={<Directions />}
                href={mapHref(event.map)}
                target="_blank"
              >
                Directions
              </Button>
            )}
            {event.tabelog && (
              <Button
                size="small"
                color="secondary"
                href={event.tabelog}
                target="_blank"
              >
                食べログ
              </Button>
            )}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
