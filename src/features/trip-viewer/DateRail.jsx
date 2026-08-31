import { Container, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useViewerData } from "./viewerContext";

export function DateRail({ selected, onSelect }) {
  const { days } = useViewerData();
  return (
    <Paper square sx={{ position: "sticky", top: 0, zIndex: 10, borderBottom: 1, borderColor: "divider", bgcolor: "color-mix(in srgb, var(--trip-color-paper) 94%, transparent)", backdropFilter: "blur(12px)" }}>
      <Container maxWidth="lg" disableGutters>
        <Tabs value={selected} onChange={(_, value) => onSelect(value)} variant="fullWidth" aria-label="選擇旅行日期" sx={{ minHeight: 76, "& .MuiTab-root": { minWidth: 0, minHeight: 76, p: 0.5, fontSize: 10 }, "& .Mui-selected": { color: "text.primary" } }}>
          {days.map((day) => (
            <Tab key={day.id} value={day.date} onClick={() => { if (selected === day.date) onSelect(day.date); }} label={(
              <Stack spacing={0} alignItems="center">
                <Typography fontFamily="ui-monospace" fontSize={18} fontWeight={700}>{day.n}</Typography>
                <Typography fontFamily="ui-monospace" fontSize={9}>{day.dow}</Typography>
                <Typography fontSize={10}>{day.label}</Typography>
              </Stack>
            )} />
          ))}
        </Tabs>
      </Container>
    </Paper>
  );
}
