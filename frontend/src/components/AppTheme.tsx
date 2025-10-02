import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import type { ThemeOptions } from "@mui/material/styles";
import type { ReactNode } from "react";

const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9", // bluish primary
    },
    secondary: {
      main: "#f48fb1", // pink accent
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
};

const darkTheme = createTheme(darkThemeOptions);

export default function AppTheme({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={darkTheme}>
      {/* CssBaseline applies global dark colors */}
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
