import { Box } from "@mui/material";
import {
  Attractions,
  Coffee,
  EventNote,
  Flight,
  Hotel,
  Restaurant,
  Train,
} from "@mui/icons-material";

const icons = {
  flight: Flight,
  hotel: Hotel,
  activity: Attractions,
  restaurant: Restaurant,
  transport: Train,
  free_time: Coffee,
};

export function EventIcon({ type }) {
  const Icon = icons[type] || EventNote;

  return (
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        bgcolor: "background.default",
        display: "grid",
        placeItems: "center",
        flex: "0 0 auto",
      }}
    >
      <Icon sx={{ fontSize: 18, color: "primary.main" }} />
    </Box>
  );
}
