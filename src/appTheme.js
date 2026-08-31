import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  cssVariables: { nativeColor: true },
  palette: {
    mode: "light",
    background: { default: "var(--trip-color-paper)", paper: "var(--trip-color-surface)" },
    primary: { main: "var(--trip-color-moss)" },
    secondary: { main: "var(--trip-color-orange)" },
    text: { primary: "var(--trip-color-ink)", secondary: "var(--trip-color-muted)" },
    success: { main: "var(--trip-color-success)" },
    warning: { main: "var(--trip-color-warning)" },
  },
  shape: { borderRadius: 2 },
  typography: {
    fontFamily: "var(--trip-font-sans)",
    h1: { fontFamily: "var(--trip-font-serif)", fontWeight: 700 },
    h2: { fontFamily: "var(--trip-font-serif)", fontWeight: 700 },
    h3: { fontFamily: "var(--trip-font-serif)", fontWeight: 700 },
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
