import { Container, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import { days } from "../data/tripData";

export function DateRail({ selected, onSelect }) {
  return (
    <Paper
      className="sticky top-0 z-10 border-b border-black/10 bg-trip-paper/95 backdrop-blur-xl"
      square
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "rgba(243,241,235,.94)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <Tabs
          value={selected}
          onChange={(_, value) => onSelect(value)}
          variant="fullWidth"
          aria-label="選擇旅行日期"
          sx={{
            minHeight: 76,
            "& .MuiTab-root": {
              minWidth: 0,
              minHeight: 76,
              p: 0.5,
              fontSize: 10,
            },
            "& .Mui-selected": { color: "text.primary" },
          }}
        >
          {days.map((day) => (
            <Tab
              key={day.date}
              value={day.date}
              label={
                <Stack spacing={0} alignItems="center">
                  <Typography
                    fontFamily="ui-monospace"
                    fontSize={18}
                    fontWeight={700}
                  >
                    {day.n}
                  </Typography>
                  <Typography fontFamily="ui-monospace" fontSize={9}>
                    {day.dow}
                  </Typography>
                  <Typography fontSize={10}>{day.label}</Typography>
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Container>
    </Paper>
  );
}
