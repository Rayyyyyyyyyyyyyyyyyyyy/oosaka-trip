import { Paper, Tab, Tabs, Typography } from "@mui/material";
import { useViewerData } from "./viewerContext";

export function DateRail({ selected, onSelect }) {
  const { days } = useViewerData();
  return (
    <Paper
      square
      className="!sticky top-0 z-10 border-b !border-trip-hairline !bg-[color-mix(in_srgb,var(--trip-color-paper)_92%,transparent)] backdrop-blur-[14px]"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <Tabs
          value={selected}
          onChange={(_, value) => onSelect(value)}
          variant="scrollable"
          scrollButtons={false}
          aria-label="選擇旅行日期"
          className="!min-h-[70px]"
          sx={{
            "& .MuiTabs-flexContainer": { justifyContent: { sm: "center" } },
            "& .MuiTabs-indicator": {
              height: 4,
              bgcolor: "var(--trip-color-attention)",
            },
            "& .MuiTab-root": {
              minWidth: { xs: 65, sm: 92 },
              minHeight: 70,
              px: 1,
              py: 0.75,
              color: "text.secondary",
            },
            "& .Mui-selected": { color: "var(--trip-color-attention)" },
          }}
        >
          {days.map((day) => (
            <Tab
              key={day.id}
              value={day.date}
              aria-current={selected === day.date ? "date" : undefined}
              onClick={() => {
                if (selected === day.date) onSelect(day.date);
              }}
              label={
                <div className="flex flex-col items-center">
                  <Typography
                    fontFamily="var(--trip-font-serif)"
                    fontSize={21}
                    fontWeight={700}
                    lineHeight={1}
                  >
                    {day.n}
                  </Typography>
                  <Typography
                    fontFamily="var(--trip-font-utility)"
                    fontSize={9}
                  >
                    {day.dow}
                  </Typography>
                  <Typography fontSize={10}>{day.label}</Typography>
                </div>
              }
            />
          ))}
        </Tabs>
      </div>
    </Paper>
  );
}
