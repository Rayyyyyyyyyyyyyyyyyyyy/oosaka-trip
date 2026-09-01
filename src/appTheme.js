import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  cssVariables: { nativeColor: true },
  palette: {
    mode: "light",
    background: {
      default: "var(--trip-color-paper)",
      paper: "var(--trip-color-surface)",
    },
    primary: { main: "var(--trip-color-movement)" },
    secondary: { main: "var(--trip-color-attention)" },
    text: {
      primary: "var(--trip-color-ink)",
      secondary: "var(--trip-color-muted)",
    },
    success: { main: "var(--trip-color-success)" },
    warning: { main: "var(--trip-color-warning)" },
  },
  shape: { borderRadius: 2 },
  typography: {
    fontFamily: "var(--trip-font-sans)",
    h1: {
      fontFamily: "var(--trip-font-serif)",
      fontWeight: 700,
      lineHeight: 1.04,
      letterSpacing: "-0.025em",
    },
    h2: {
      fontFamily: "var(--trip-font-serif)",
      fontWeight: 700,
      lineHeight: 1.12,
    },
    h3: {
      fontFamily: "var(--trip-font-serif)",
      fontWeight: 700,
      lineHeight: 1.22,
    },
    overline: {
      fontFamily: "var(--trip-font-utility)",
      letterSpacing: 1.8,
      fontWeight: 700,
      fontSize: "0.68rem",
    },
  },
  components: {
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 44,
          fontFamily: "var(--trip-font-utility)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.5,
          "&.Mui-disabled": {
            color: "var(--trip-color-ink)",
            backgroundColor:
              "color-mix(in srgb, var(--trip-color-ink) 10%, transparent)",
            borderColor: "var(--trip-color-hairline)",
            cursor: "not-allowed",
            opacity: 1,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { minWidth: 44, minHeight: 44 } },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          color: "var(--trip-color-ink)",
          "& .MuiAlert-message": { color: "var(--trip-color-ink)" },
          "& .MuiAlert-icon": { opacity: 1 },
          "&.MuiAlert-standardError": {
            backgroundColor:
              "color-mix(in srgb, var(--trip-color-attention) 14%, var(--trip-color-surface))",
            "& .MuiAlert-icon": { color: "var(--trip-color-attention)" },
          },
          "&.MuiAlert-standardWarning": {
            backgroundColor:
              "color-mix(in srgb, var(--trip-color-warning) 12%, var(--trip-color-surface))",
            "& .MuiAlert-icon": { color: "var(--trip-color-warning)" },
          },
          "&.MuiAlert-standardInfo": {
            backgroundColor:
              "color-mix(in srgb, var(--trip-color-movement) 12%, var(--trip-color-surface))",
            "& .MuiAlert-icon": { color: "var(--trip-color-movement)" },
          },
          "&.MuiAlert-standardSuccess": {
            backgroundColor:
              "color-mix(in srgb, var(--trip-color-readiness) 12%, var(--trip-color-surface))",
            "& .MuiAlert-icon": { color: "var(--trip-color-readiness)" },
          },
          "&.MuiAlert-outlinedError": {
            borderColor: "var(--trip-color-attention)",
            backgroundColor:
              "color-mix(in srgb, var(--trip-color-attention) 7%, var(--trip-color-surface))",
            "& .MuiAlert-icon": { color: "var(--trip-color-attention)" },
          },
          "&.MuiAlert-outlinedWarning": {
            borderColor: "var(--trip-color-warning)",
            backgroundColor:
              "color-mix(in srgb, var(--trip-color-warning) 7%, var(--trip-color-surface))",
            "& .MuiAlert-icon": { color: "var(--trip-color-warning)" },
          },
          "&.MuiAlert-outlinedInfo": {
            borderColor: "var(--trip-color-movement)",
            backgroundColor:
              "color-mix(in srgb, var(--trip-color-movement) 7%, var(--trip-color-surface))",
            "& .MuiAlert-icon": { color: "var(--trip-color-movement)" },
          },
          "&.MuiAlert-outlinedSuccess": {
            borderColor: "var(--trip-color-readiness)",
            backgroundColor:
              "color-mix(in srgb, var(--trip-color-readiness) 7%, var(--trip-color-surface))",
            "& .MuiAlert-icon": { color: "var(--trip-color-readiness)" },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: "var(--trip-color-ink)",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--trip-color-hairline)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--trip-color-movement)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--trip-color-focus)",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "var(--trip-color-muted)",
          "&.Mui-focused": { color: "var(--trip-color-focus)" },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: { root: { color: "var(--trip-color-muted)" } },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "var(--trip-font-utility)",
          fontWeight: 700,
          fontSize: 10,
        },
      },
    },
    MuiListItemButton: { styleOverrides: { root: { minHeight: 48 } } },
  },
});
