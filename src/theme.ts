import type { Theme } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";

export type ThemeMode = "light" | "dark";

export function buildTheme(mode: ThemeMode): Theme {
  return createTheme({
    palette: {
      mode,
      primary: { main: "#6366f1" },
      secondary: { main: "#ec4899" },
      ...(mode === "dark"
        ? {
            background: { default: "#0f172a", paper: "#1e293b" },
          }
        : {
            background: { default: "#f8fafc", paper: "#ffffff" },
          }),
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontWeight: 600 },
    },
  });
}

export const WHEEL_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
];
