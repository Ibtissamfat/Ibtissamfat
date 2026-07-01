import type { Match, RoundKey } from "../types";

// A static snapshot of the real FIFA World Cup 2026 knockout stage, captured on
// 2026-07-01 from public results/schedule reporting. It is used only when the
// live feed (football-data.org / TheSportsDB) is unavailable, so the app still
// shows the actual bracket rather than invented data.
//
// Only the Round of 32 is included: eight ties have been played, eight are still
// to come (no scores), and every later round is intentionally omitted so the
// bracket renders them as undecided "?" slots — which is their real state today.
//
// Order matters: the app splits each round in half (first half -> left side,
// second half -> right side) and pairs neighbours, so this ordering reproduces
// the official matchups (Paraguay–France, Canada–Morocco, Brazil–Norway,
// Mexico–England, ...). Kickoff times weren't reliably available, so dates are
// stored date-only; venues are filled where known.

interface RawMatch {
  home: string;
  away: string;
  homeScore?: number;
  awayScore?: number;
  homePens?: number;
  awayPens?: number;
  date: string; // YYYY-MM-DD
  venue?: string;
}

const R32: RawMatch[] = [
  // ----- Left side (top → bottom) -----
  { home: "Germany", away: "Paraguay", homeScore: 1, awayScore: 1, homePens: 3, awayPens: 4, date: "2026-06-29" },
  { home: "France", away: "Sweden", homeScore: 3, awayScore: 0, date: "2026-06-30" },
  { home: "Canada", away: "South Africa", homeScore: 1, awayScore: 0, date: "2026-06-28" },
  { home: "Netherlands", away: "Morocco", homeScore: 1, awayScore: 1, homePens: 2, awayPens: 3, date: "2026-06-30" },
  { home: "Portugal", away: "Croatia", date: "2026-07-02", venue: "BMO Field, Toronto" },
  { home: "Spain", away: "Austria", date: "2026-07-02", venue: "SoFi Stadium, Inglewood" },
  { home: "USA", away: "Bosnia and Herzegovina", date: "2026-07-01", venue: "San Francisco Bay Area" },
  { home: "Belgium", away: "Senegal", date: "2026-07-01", venue: "Seattle" },
  // ----- Right side (top → bottom) -----
  { home: "Brazil", away: "Japan", homeScore: 2, awayScore: 1, date: "2026-06-29" },
  { home: "Norway", away: "Ivory Coast", homeScore: 2, awayScore: 1, date: "2026-06-30" },
  { home: "Mexico", away: "Ecuador", homeScore: 2, awayScore: 0, date: "2026-07-01" },
  { home: "England", away: "DR Congo", homeScore: 2, awayScore: 1, date: "2026-07-01" },
  { home: "Argentina", away: "Cape Verde", date: "2026-07-03", venue: "Hard Rock Stadium, Miami Gardens" },
  { home: "Australia", away: "Egypt", date: "2026-07-03", venue: "AT&T Stadium, Arlington" },
  { home: "Switzerland", away: "Algeria", date: "2026-07-02", venue: "BC Place, Vancouver" },
  { home: "Colombia", away: "Ghana", date: "2026-07-03", venue: "Arrowhead Stadium, Kansas City" },
];

export function buildFallbackBracket(): Match[] {
  return R32.map((m, i) => ({
    id: `wc26-R32-${i}`,
    round: "R32" as RoundKey,
    homeTeam: m.home,
    awayTeam: m.away,
    homeScore: m.homeScore ?? null,
    awayScore: m.awayScore ?? null,
    homePens: m.homePens ?? null,
    awayPens: m.awayPens ?? null,
    date: m.date,
    venue: m.venue ?? null,
  }));
}
