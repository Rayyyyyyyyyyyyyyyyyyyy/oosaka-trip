import {
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowForward,
  ErrorOutline,
  FlightTakeoff,
  Hotel,
  Luggage,
} from "@mui/icons-material";
import { selectReadinessAttention } from "../../domain/trip/selectors";
import { useTripTodos } from "./useTripTodos";
import { useViewerData } from "./viewerContext";

function JourneyMotif({ labels }) {
  const route = labels.length > 0 ? labels : ["JOURNEY"];
  return (
    <Box
      component="figure"
      aria-label={`Schematic journey: ${route.join(" to ")}`}
      className="relative m-0 mt-7 min-h-[210px] overflow-hidden bg-trip-travel px-5 py-8 text-[#fffaf0] sm:min-h-[230px] sm:px-8 sm:py-10 md:mt-10"
    >
      <Box
        aria-hidden="true"
        className="absolute -right-[58px] -top-[92px] h-[210px] w-[210px] rounded-full border-[42px] border-[color-mix(in_srgb,var(--trip-color-movement)_60%,transparent)]"
      />
      <Box
        aria-hidden="true"
        className="absolute right-[42px] top-[35px] h-[78px] w-[78px] rounded-full bg-trip-warmth sm:right-[82px]"
      />
      <Typography variant="overline" className="!relative !text-trip-warmth">
        SCHEMATIC JOURNEY · ORDERED STOPS
      </Typography>
      <ol className="relative m-0 mt-12 flex w-full list-none items-start p-0">
        {route.map((label, index) => (
          <li key={`${label}-${index}`} className="min-w-0 flex-1">
            <div className="flex items-center">
              <Box
                aria-hidden="true"
                className={`h-[11px] w-[11px] flex-none rounded-full outline-[4px] outline-[color-mix(in_srgb,currentColor_16%,transparent)] ${
                  index === route.length - 1
                    ? "bg-trip-attention"
                    : "bg-trip-warmth"
                }`}
              />
              {index < route.length - 1 && (
                <Box
                  aria-hidden="true"
                  className="mx-1.5 h-px flex-1 bg-[rgba(255,250,240,.55)]"
                />
              )}
            </div>
            <Typography className="!mt-2.5 !pr-1.5 !font-utility !text-[10px] !font-bold [overflow-wrap:anywhere] sm:!text-xs">
              {label}
            </Typography>
          </li>
        ))}
      </ol>
    </Box>
  );
}

function AnchorRow({ icon, label, title, meta }) {
  return (
    <div className="flex items-start gap-4 py-[18px]">
      <Box className="pt-0.5 text-trip-movement">{icon}</Box>
      <Typography
        variant="overline"
        className="!w-[54px] shrink-0 !text-trip-muted"
      >
        {label}
      </Typography>
      <Box className="min-w-0 flex-1">
        <Typography fontWeight={800}>{title}</Typography>
        {meta && (
          <Typography variant="body2" color="text.secondary" className="!mt-1">
            {meta}
          </Typography>
        )}
      </Box>
    </div>
  );
}

export function Overview({ onDay, onReservations }) {
  const { canonicalTrip, trip, days, reservations, initialTodos } =
    useViewerData();
  const [todos] = useTripTodos(canonicalTrip.id, initialTodos);
  const attention = selectReadinessAttention(reservations, todos);
  const hasAnchors = trip.flights.length > 0 || Boolean(trip.stay);

  return (
    <div data-testid="overview-reading-order">
      <Box component="header">
        <Typography variant="overline" color="secondary">
          YOUR TRIP · {trip.days} {trip.days === 1 ? "DAY" : "DAYS"}
        </Typography>
        <Typography
          variant="h1"
          className="!mt-3 !text-[50px] sm:!text-[64px] md:!text-[78px]"
        >
          {trip.period}
        </Typography>
        <Typography variant="h2" className="!mt-5 !text-[25px] md:!text-[32px]">
          {trip.title}
        </Typography>
        <Typography color="text.secondary" className="!mt-2 max-w-[560px]">
          {days.map((day) => day.label).join(" · ")}
        </Typography>
      </Box>

      <JourneyMotif labels={trip.journeyLabels} />

      {attention && (
        <Box
          component="section"
          aria-labelledby="readiness-heading"
          className="mt-8 px-5 py-5 sm:px-7 md:mt-10"
          sx={{
            borderLeft: "6px solid var(--trip-color-attention)",
            bgcolor:
              "color-mix(in srgb, var(--trip-color-attention) 10%, var(--trip-color-surface))",
          }}
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex gap-3">
              <ErrorOutline className="!mt-0.5 !text-trip-attention" />
              <Box>
                <Typography
                  id="readiness-heading"
                  variant="overline"
                  color="secondary"
                >
                  ONE THING BEFORE YOU GO
                </Typography>
                <Typography fontWeight={800} className="!mt-1">
                  {attention.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {attention.status}
                </Typography>
              </Box>
            </div>
            {onReservations && (
              <Button
                onClick={onReservations}
                endIcon={<ArrowForward />}
                className="self-start sm:self-center"
              >
                Check bookings
              </Button>
            )}
          </div>
        </Box>
      )}

      {hasAnchors && (
        <Box
          component="section"
          aria-labelledby="travel-anchors-heading"
          className="mt-10 md:mt-14"
        >
          <Typography
            id="travel-anchors-heading"
            variant="overline"
            color="text.secondary"
          >
            TRAVEL ANCHORS
          </Typography>
          <Stack
            divider={<Divider flexItem />}
            className="mt-3 border-y border-trip-hairline"
          >
            {trip.flights[0] && (
              <AnchorRow
                icon={<FlightTakeoff fontSize="small" />}
                label="FLIGHT"
                title={`${trip.flights[0].code} · ${trip.flights[0].route}`}
                meta={trip.flights[0].date}
              />
            )}
            {trip.stay && (
              <AnchorRow
                icon={<Hotel fontSize="small" />}
                label="STAY"
                title={trip.stay.title}
                meta={`${trip.stay.period}${trip.stay.details ? ` · ${trip.stay.details}` : ""}`}
              />
            )}
            {trip.flights.slice(1).map((flight) => (
              <AnchorRow
                key={flight.id}
                icon={<FlightTakeoff fontSize="small" />}
                label="FLIGHT"
                title={`${flight.code} · ${flight.route}`}
                meta={flight.date}
              />
            ))}
          </Stack>
        </Box>
      )}

      <Box
        component="section"
        aria-labelledby="day-index-heading"
        className="mt-10 md:mt-14"
      >
        <div className="flex items-center gap-2">
          <Luggage fontSize="small" className="!text-trip-movement" />
          <Typography
            id="day-index-heading"
            variant="overline"
            color="text.secondary"
          >
            DAY JOURNEY INDEX
          </Typography>
        </div>
        <List disablePadding className="!mt-3 border-t border-trip-hairline">
          {days.map((day) => (
            <ListItemButton
              key={day.id}
              onClick={() => onDay(day.date)}
              aria-label={`${day.month} ${day.n}, ${day.title}`}
              className="!items-start !gap-3 !border-b !border-trip-hairline !px-0 !py-4 sm:!gap-5"
              sx={{
                "&:hover": {
                  bgcolor:
                    "color-mix(in srgb, var(--trip-color-movement) 8%, transparent)",
                },
              }}
            >
              <Typography className="!w-9 shrink-0 !font-serif-jp !text-[26px] !leading-none">
                {day.n}
              </Typography>
              <Typography className="!w-[42px] shrink-0 !pt-1 !font-utility !text-[10px] !text-trip-muted">
                {day.dow}
              </Typography>
              <div className="min-w-0 flex-1">
                <Typography fontWeight={800}>{day.title}</Typography>
                {day.subtitle && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    className="!mt-[3px]"
                  >
                    {day.subtitle}
                  </Typography>
                )}
              </div>
              <ArrowForward
                fontSize="small"
                className="!mt-0.5 !text-trip-attention"
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </div>
  );
}
