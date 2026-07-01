# Road to the Final ⚽🏆

A fun, animated tracker for the FIFA World Cup knockout stage — Round of 32 through
the Final — built with React, TypeScript, Vite, and Framer Motion.

## Features

- Fetches live World Cup 2026 knockout results from [TheSportsDB](https://www.thesportsdb.com/).
- Falls back to a colorful demo bracket automatically if the live feed is
  unavailable, so the app always has something fun to show.
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

## Build

```bash
npm run build
npm run preview
```

## How it works

- `src/api/worldCupApi.ts` — fetches and normalizes knockout-stage matches,
  falling back to `src/data/fallbackBracket.ts` on any error.
- `src/utils/rounds.ts` — maps raw round names to a canonical order/label/emoji.
- `src/utils/flags.ts` — converts country names to flag emoji.
- `src/components/RoadToFinal.tsx` — groups matches by round and renders the
  animated timeline, triggering confetti via `useChampionConfetti` once the
  Final has a result.
