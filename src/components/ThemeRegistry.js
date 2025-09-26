"use client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

export default function ThemeRegistry({ children }) {
  const theme = createTheme({
    palette: {
      mode: "light",
      primary: { main: "#1565c0" },
      secondary: { main: "#00bfa5" },
      background: { default: "#fafafa" },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: `Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"`,
      h3: { fontWeight: 800 },
      h4: { fontWeight: 800 },
      h5: { fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiCard: { styleOverrides: { root: { borderRadius: 14 } } },
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiContainer: { defaultProps: { maxWidth: "lg" } },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}


