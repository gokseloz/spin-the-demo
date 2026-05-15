import { useMemo, useEffect, useCallback } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Wheel from "./components/Wheel";
import RosterPanel from "./components/RosterPanel";
import HistoryList from "./components/HistoryList";
import LoginScreen from "./components/LoginScreen";
import { useStore } from "./hooks/useStore";
import { useAuth } from "./hooks/useAuth";
import { getEligible } from "./lib/pickWinner";
import { playWinSound } from "./lib/sound";
import { isSupabaseConfigured } from "./lib/supabase";
import { buildTheme } from "./theme";
import type { Participant } from "./types";

export default function App() {
  const { session, loading: authLoading, signIn, signOut } = useAuth();
  const authed = Boolean(session) || !isSupabaseConfigured;
  const store = useStore(authed);

  const theme = useMemo(
    () => buildTheme(store.settings.themeMode),
    [store.settings.themeMode],
  );

  const eligible = useMemo(
    () =>
      getEligible(store.participants, store.spins, store.settings.excludeLastN),
    [store.participants, store.spins, store.settings.excludeLastN],
  );

  const handleWinner = useCallback(
    (winner: Participant) => {
      store.recordSpin(winner);
      if (store.settings.soundEnabled) playWinSound();
    },
    [store],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      const el = document.activeElement as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable ||
          el.tagName === "BUTTON")
      ) {
        return;
      }
      e.preventDefault();
      const btn = document.querySelector<HTMLButtonElement>(
        "button.MuiButton-containedPrimary",
      );
      btn?.click();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (isSupabaseConfigured && authLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="text.secondary">Loading…</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  if (isSupabaseConfigured && !session) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginScreen onSignIn={signIn} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            🎡 Spin the Demo
          </Typography>
          {!isSupabaseConfigured && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mr: 2 }}
            >
              local mode
            </Typography>
          )}
          <IconButton
            onClick={() =>
              store.updateSettings({
                themeMode:
                  store.settings.themeMode === "dark" ? "light" : "dark",
              })
            }
            color="inherit"
            aria-label="Toggle theme"
          >
            {store.settings.themeMode === "dark" ? (
              <LightModeIcon />
            ) : (
              <DarkModeIcon />
            )}
          </IconButton>
          {isSupabaseConfigured && session && (
            <Button color="inherit" onClick={signOut} size="small">
              Sign out
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ flex: "0 0 auto" }}>
            <Wheel
              participants={store.participants}
              eligible={eligible}
              onWinner={handleWinner}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", textAlign: "center", mt: 1 }}
            >
              Press <kbd>Space</kbd> to spin · greyed slices are auto-excluded
            </Typography>
          </Box>

          <Stack spacing={3} sx={{ flex: 1, width: "100%", maxWidth: 480 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Settings
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <TextField
                  label="Exclude last N spins"
                  type="number"
                  size="small"
                  value={store.settings.excludeLastN}
                  onChange={(e) =>
                    store.updateSettings({
                      excludeLastN: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  slotProps={{ htmlInput: { min: 0, max: 20 } }}
                  sx={{ width: 160 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={store.settings.soundEnabled}
                      onChange={(e) =>
                        store.updateSettings({ soundEnabled: e.target.checked })
                      }
                    />
                  }
                  label="Sound"
                />
              </Box>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <RosterPanel
                participants={store.participants}
                onAdd={store.addParticipant}
                onUpdate={store.updateParticipant}
                onDelete={store.deleteParticipant}
                onSetActive={store.setActive}
              />
            </Paper>

            <Paper sx={{ p: 2 }}>
              <HistoryList
                spins={store.spins}
                onDelete={store.deleteSpin}
                onClear={store.clearHistory}
              />
              {store.resetAll && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    onClick={() => {
                      if (confirm("Reset everything to defaults?"))
                        store.resetAll?.();
                    }}
                    sx={{ cursor: "pointer", textDecoration: "underline" }}
                  >
                    Reset all data
                  </Typography>
                </>
              )}
            </Paper>
          </Stack>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
