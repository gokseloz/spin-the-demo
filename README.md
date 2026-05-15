# 🎡 Spin the Demo

A team wheel for picking the next demo presenter. React + MUI + Vite, optionally backed by Supabase for shared state across the team.

## Features

- Animated wheel with confetti + win sound
- Roster CRUD with emoji per person
- Auto-exclude the last N presenters (configurable)
- "Already presented" pool with one-click restore
- History log
- Dark / light theme
- Spacebar to spin
- **Local mode**: works fully offline with localStorage
- **Team mode**: Supabase backend with shared login + realtime sync

## Running locally

```sh
npm install
npm run dev
```

Open http://localhost:5173/spin-the-demo/

Without env vars set, the app runs in **local mode** — everything persists to your browser's localStorage. Perfect for trying it out.

## Setting up Supabase (team mode)

1. Create a free Supabase project at https://supabase.com (no credit card).
2. In the SQL editor, paste and run [`supabase/schema.sql`](./supabase/schema.sql). This creates the `participants` + `spins` tables, RLS policies, realtime publication, and seeds the roster.
3. Create a single shared user: **Authentication → Users → Add user → "Create new user"**. Use an email + password the team will share. Confirm the email manually in the dashboard.
4. Copy `.env.example` to `.env.local` and fill in:
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
   (Both values come from **Project Settings → API**.)
5. Restart `npm run dev`. You'll now see a login screen — sign in with the shared account.

> The anon key is safe to expose publicly **because RLS requires `authenticated` for all reads/writes.** Anyone without the shared password gets 401s.

## Deploying to GitHub Pages

1. Create a public GitHub repo named **`spin-the-demo`** (the Vite `base` path in `vite.config.ts` must match the repo name).
2. Push this folder:
   ```sh
   git init -b main
   git add .
   git commit -m "feature: initial spin-the-demo app"
   git remote add origin git@github.com:YOUR-USERNAME/spin-the-demo.git
   git push -u origin main
   ```
3. In the repo **Settings → Pages**, set **Source: GitHub Actions**.
4. In **Settings → Secrets and variables → Actions**, add two repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. The `Deploy to GitHub Pages` workflow runs on every push to `main`. After it completes, the app is live at `https://YOUR-USERNAME.github.io/spin-the-demo/`.

## Keep-alive

`.github/workflows/keepalive.yml` runs every 3 days to ping the database and prevent Supabase's 7-day inactivity pause. No action needed — it picks up the same repo secrets.

## Stack

- Vite + React 19 + TypeScript
- MUI v9
- Supabase (Postgres + Auth + Realtime)
- canvas-confetti
- GitHub Pages + GitHub Actions

## Project layout

```
src/
  components/    # Wheel, RosterPanel, HistoryList, LoginScreen
  hooks/         # useLocalStore, useSupabaseStore, useStore, useAuth
  lib/           # supabase client, pickWinner, sound
  theme.ts       # MUI theme + wheel colors
  types.ts       # Participant / Spin / Settings
supabase/
  schema.sql     # Tables, RLS, realtime, seed data
.github/workflows/
  deploy.yml     # GH Pages deploy
  keepalive.yml  # Supabase ping every 3 days
```
