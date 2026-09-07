import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { Attractions, Map } from "@mui/icons-material";
import { EventCard } from "../components/EventCard";
import { mapUrl } from "../lib/tripRuntime";

export function DayView({ day }) {
  return (
    <>
      <Typography variant="overline" color="secondary">
        {day.dow} · SEP {day.n}
      </Typography>
      <Typography variant="h1" fontSize={{ xs: 38, md: 56 }} mt={1}>
        {day.title}
      </Typography>
      <Typography color="text.secondary" mt={1}>
        {day.subtitle}
      </Typography>
      {day.special ? (
        <Paper
          className="my-10 border-y border-trip-ink bg-trip-surface px-6 py-12 text-center md:px-16 md:py-20"
          sx={{
            my: 5,
            p: { xs: 4, md: 8 },
            textAlign: "center",
            borderTop: 1,
            borderBottom: 1,
            borderColor: "text.primary",
          }}
        >
          <Attractions sx={{ fontSize: 42 }} />
          <Typography
            variant="overline"
            display="block"
            color="secondary"
            mt={2}
          >
            HALLOWEEN · ALL DAY
          </Typography>
          <Typography variant="h2" fontSize={{ xs: 32, md: 48 }} my={3}>
            UNIVERSAL STUDIOS
            <br />
            JAPAN
          </Typography>
          <Typography>今天沒有其他行程。</Typography>
          <Button
            sx={{ mt: 2 }}
            startIcon={<Map />}
            href={mapUrl("Universal Studios Japan")}
            target="_blank"
          >
            Open map
          </Button>
          <Typography
            mt={6}
            fontFamily='"Noto Serif TC",serif'
            fontWeight={700}
          >
            晚上唯一判斷標準：
            <br />
            「我還活著嗎？」
          </Typography>
        </Paper>
      ) : (
        <Stack mt={5}>
          {day.events.map((event, index) => (
            <EventCard key={index} event={event} />
          ))}
        </Stack>
      )}
      {day.optional && (
        <Paper sx={{ mt: 4, p: 3, bgcolor: "#e9e7e0" }}>
          <Typography variant="overline" color="text.secondary">
            {day.optionalLabel || "IF YOU STILL HAVE ENERGY"}
          </Typography>
          <Stack direction="row" gap={1} flexWrap="wrap" mt={2}>
            {day.optional.map((place) => (
              <Chip
                className="transition-colors hover:bg-white"
                key={place.name}
                icon={<Map />}
                label={place.name}
                variant="outlined"
                component="a"
                href={place.map}
                target="_blank"
                rel="noreferrer"
                clickable
              />
            ))}
          </Stack>
        </Paper>
      )}
      {day.sections?.map((section) => (
        <Paper
          key={section.title}
          sx={{ mt: 4, p: 3, borderTop: 1, borderColor: "text.primary" }}
        >
          <Typography variant="overline" color="secondary">
            {section.eyebrow || "FLEXIBLE PLAN"}
          </Typography>
          <Typography variant="h2" fontSize={25} mt={1}>
            {section.title}
          </Typography>
          {section.intro && (
            <Typography color="text.secondary" mt={1}>
              {section.intro}
            </Typography>
          )}
          <Stack mt={2.5} spacing={2}>
            {section.items.map((item) => (
              <Box key={item.title}>
                <Typography fontWeight={700}>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  {item.detail}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      ))}
    </>
  );
}
