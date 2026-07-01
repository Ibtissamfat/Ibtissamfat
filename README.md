# Road to the Final ⚽🏆

A fun, animated tracker for the FIFA World Cup knockout stage — Round of 32 through
the Final — built with React, TypeScript, Vite, and Framer Motion.

## Features

- Fetches live World Cup 2026 knockout results, trying
  [football-data.org](https://www.football-data.org/) first (requires a free
  API key), then [TheSportsDB](https://www.thesportsdb.com/) as a keyless
  backup (its free tier has become unreliable for event data).
- Falls back to a colorful demo bracket automatically if no live source
  responds, so the app always has something fun to show. The status badge
  always says plainly which one you're looking at.
- Animated "road" timeline connecting each round, with country flags, winner
  badges, and a confetti celebration when a champion is crowned.
- Live/Demo status badge with a manual refresh button, and auto-refresh every 60s.
- Installable as a Progressive Web App — add it to your phone's home screen
  for a full-screen, app-like experience with an offline-capable service worker.

## Install it on your phone

There's no `.apk` — instead the app is a installable PWA, which works on both
Android and iOS without any app-store build:

1. Open the deployed/preview URL on your phone's browser (must be served over
   HTTPS, or `localhost` for local testing).
2. **Android (Chrome)**: tap the ⋮ menu → "Add to Home screen" / "Install app".
3. **iOS (Safari)**: tap the Share icon → "Add to Home Screen".
4. Launch it from the home screen icon — it opens full-screen, no browser chrome.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

### Getting real live data (recommended)

Without a key the app will keep falling back to demo data, since TheSportsDB's
free tier no longer reliably serves event/season data. To get accurate results:

1. Register for a free API key at
   [football-data.org/client/register](https://www.football-data.org/client/register)
   (takes about a minute, no credit card).
2. Copy `.env.local.example` to `.env.local` and paste your key in:
   ```
   VITE_FOOTBALL_DATA_API_KEY=your-key-here
   ```
3. Restart `npm run dev` (or rebuild). The status badge will say
   "Live data (football-data.org)" once it's working.

For the GitHub Pages deployment, add the same value as a repository secret
named `FOOTBALL_DATA_API_KEY` (Settings → Secrets and variables → Actions →
New repository secret) — the deploy workflow already reads it into the build.

Note: since this is a static site with no backend, the key ends up visible in
the public JS bundle. That's expected and fine for football-data.org's free,
rate-limited tier — just don't reuse a paid/production key here.

## Build

```bash
npm run build
npm run preview
```

## How it works

- `src/api/footballDataApi.ts` — primary live source (needs an API key).
- `src/api/worldCupApi.ts` — tries football-data.org, then TheSportsDB,
  then falls back to `src/data/fallbackBracket.ts` if both fail.
- `src/utils/rounds.ts` — maps raw round names to a canonical order/label/emoji.
- `src/utils/flags.ts` — converts country names to flag emoji.
- `src/components/RoadToFinal.tsx` — groups matches by round and renders the
  animated timeline, triggering confetti via `useChampionConfetti` once the
  Final has a result.
