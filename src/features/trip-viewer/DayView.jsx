import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Link,
  Typography,
} from "@mui/material";
import { ArrowBack, ArrowDownward, ExpandMore, Map } from "@mui/icons-material";
import { EventCard, EventIcon } from "./EventPresentation";

function DayAtmosphere({ atmosphere }) {
  const cues = [
    atmosphere.movement && "MOVEMENT",
    atmosphere.flexible && "FLEXIBLE PACE",
  ].filter(Boolean);
  return (
    <Box
      role="img"
      aria-label={`Travel atmosphere for ${atmosphere.label}${cues.length ? `: ${cues.join(", ")}` : ""}`}
      className="relative mt-7 min-h-[150px] overflow-hidden px-5 py-7 sm:px-8"
      sx={{
        bgcolor:
          "color-mix(in srgb, var(--trip-color-movement) 12%, var(--trip-color-surface))",
        borderBottom: "4px solid var(--trip-color-warmth)",
      }}
    >
      <Box
        aria-hidden="true"
        className="absolute -right-[35px] -top-[76px] h-[170px] w-[170px] rounded-full border-[30px] border-[color-mix(in_srgb,var(--trip-color-movement)_24%,transparent)]"
      />
      <Box
        aria-hidden="true"
        className="absolute right-12 top-[33px] h-[52px] w-[52px] rounded-full bg-trip-warmth"
      />
      <Typography variant="overline" color="text.secondary">
        DAY CHARACTER
      </Typography>
      <Typography
        variant="h2"
        className="!relative !mt-7 !text-[29px] md:!text-[35px]"
      >
        {atmosphere.label}
      </Typography>
      {cues.length > 0 && (
        <Typography className="!relative !mt-2 !font-utility !text-[11px] !font-extrabold !text-trip-movement">
          {cues.join(" · ")}
        </Typography>
      )}
    </Box>
  );
}

function FixedAnchor({ anchor }) {
  return (
    <Box
      component="section"
      aria-labelledby="fixed-anchor-heading"
      className="mt-8 px-5 py-5 sm:px-6 md:mt-10"
      sx={{
        bgcolor:
          "color-mix(in srgb, var(--trip-color-attention) 10%, var(--trip-color-surface))",
        borderLeft: "6px solid var(--trip-color-attention)",
      }}
    >
      <div className="flex items-start gap-4">
        <EventIcon type={anchor.type} />
        <Box className="min-w-0 flex-1">
          <Typography
            id="fixed-anchor-heading"
            variant="overline"
            color="secondary"
          >
            NEAREST FIXED ANCHOR
          </Typography>
          <Typography className="!mt-1 !font-utility !font-extrabold !text-trip-attention">
            {anchor.time}
          </Typography>
          <Typography fontWeight={800}>{anchor.title}</Typography>
          {anchor.status && (
            <Typography variant="caption" color="text.secondary">
              {anchor.status}
            </Typography>
          )}
        </Box>
        <Link
          href={`#event-${anchor.eventId}`}
          aria-label={`Jump to ${anchor.time} ${anchor.title} in the timeline`}
          className="grid min-h-11 min-w-11 place-items-center text-trip-attention"
        >
          <ArrowDownward />
        </Link>
      </div>
    </Box>
  );
}

export function DayView({ day, onOverview }) {
  return (
    <>
      <Box component="header">
        {onOverview && (
          <Button
            onClick={onOverview}
            startIcon={<ArrowBack />}
            className="!-ml-2.5 !mb-4"
          >
            Overview
          </Button>
        )}
        <Typography variant="overline" color="secondary">
          DAY {String(day.sequence).padStart(2, "0")} /{" "}
          {String(day.totalDays).padStart(2, "0")} · {day.dow}
        </Typography>
        <div className="mt-3 flex items-baseline gap-4 sm:gap-6">
          <Typography
            variant="h1"
            className="!text-[72px] !text-trip-attention sm:!text-[88px] md:!text-8xl"
          >
            {day.n}
          </Typography>
          <Box>
            <Typography className="!font-utility !text-xs !font-extrabold !text-trip-muted">
              {day.month}
            </Typography>
            <Typography
              variant="h2"
              className="!mt-1 !text-[30px] md:!text-[38px]"
            >
              {day.title}
            </Typography>
          </Box>
        </div>
        {day.subtitle && (
          <Typography color="text.secondary" className="!mt-3 max-w-[600px]">
            {day.subtitle}
          </Typography>
        )}
      </Box>

      <DayAtmosphere atmosphere={day.atmosphere} />
      {day.fixedAnchor && <FixedAnchor anchor={day.fixedAnchor} />}

      <Box
        component="section"
        aria-labelledby="timeline-heading"
        className="mt-10 md:mt-14"
      >
        <Typography
          id="timeline-heading"
          variant="overline"
          color="text.secondary"
        >
          SEMANTIC TIMELINE
        </Typography>
        <div className="mt-3 flex flex-col border-b border-trip-hairline">
          {day.events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </Box>

      {day.optional.length > 0 && (
        <Accordion
          disableGutters
          square
          className="!mt-8 !bg-trip-soft"
          sx={{
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            className="!min-h-[60px] !px-5 sm:!px-6"
            sx={{
              "& .MuiAccordionSummary-content": { my: 2 },
            }}
          >
            <Box>
              <Typography variant="overline" color="text.secondary">
                IF YOU STILL HAVE ENERGY
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {day.optional.length} optional places · not part of the
                committed timeline
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails className="!px-5 !pb-6 sm:!px-6">
            <div className="flex flex-wrap gap-2">
              {day.optional.map((place) =>
                place.map ? (
                  <Button
                    key={place.id}
                    startIcon={<Map />}
                    variant="outlined"
                    href={place.map}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {place.mapIsFallback
                      ? `${place.name} · unresolved`
                      : place.name}
                  </Button>
                ) : (
                  <Typography
                    key={place.id}
                    className="flex min-h-11 items-center"
                  >
                    {place.name}
                  </Typography>
                ),
              )}
            </div>
          </AccordionDetails>
        </Accordion>
      )}

      <Box
        component="footer"
        className="mt-10 border-t border-trip-hairline pt-5 md:mt-14"
      >
        <Typography variant="overline" color="text.secondary">
          END OF DAY {day.sequence} · {day.label}
        </Typography>
        {day.suggestedDeparture && (
          <Typography
            variant="body2"
            color="text.secondary"
            className="!mt-1.5"
          >
            Suggested departure window · {day.suggestedDeparture}
          </Typography>
        )}
      </Box>
    </>
  );
}
