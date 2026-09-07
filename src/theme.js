import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    background: { default: "#f3f1eb", paper: "#fbfaf6" },
    primary: { main: "#536358" },
    secondary: { main: "#e36f4d" },
    text: { primary: "#20221f", secondary: "#74766f" },
    success: { main: "#60744e" },
    warning: { main: "#b76b32" },
  },
  shape: { borderRadius: 2 },
  typography: {
    fontFamily: '"Noto Sans TC", system-ui, sans-serif',
    h1: { fontFamily: '"Noto Serif TC", serif', fontWeight: 700 },
    h2: { fontFamily: '"Noto Serif TC", serif', fontWeight: 700 },
    h3: { fontFamily: '"Noto Serif TC", serif', fontWeight: 700 },
    overline: {
      fontFamily: "ui-monospace, monospace",
      letterSpacing: 1.6,
      fontWeight: 700,
    },
  },
  components: {
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "ui-monospace, monospace",
          fontWeight: 700,
          fontSize: 10,
        },
      },
    },
  },
});
