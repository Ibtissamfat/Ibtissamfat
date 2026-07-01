import type { Match, RoundKey } from "../types";

const VENUES = [
  "MetLife Stadium, New Jersey",
  "Estadio Azteca, Mexico City",
  "BC Place, Vancouver",
  "AT&T Stadium, Dallas",
  "SoFi Stadium, Los Angeles",
  "Mercedes-Benz Stadium, Atlanta",
  "Hard Rock Stadium, Miami",
  "Lincoln Financial Field, Philadelphia",
];

type RawResult = [home: string, away: string, homeScore: number, awayScore: number];

const R32: RawResult[] = [
  ["Brazil", "Ghana", 3, 0],
  ["Uruguay", "Iraq", 2, 1],
  ["Netherlands", "Jordan", 4, 0],
  ["Senegal", "Ecuador", 1, 0],
  ["Argentina", "Panama", 2, 0],
  ["Mexico", "Tunisia", 1, 0],
  ["Portugal", "Iran", 2, 1],
  ["Morocco", "Canada", 1, 0],
  ["France", "Jamaica", 3, 0],
  ["Poland", "Saudi Arabia", 1, 0],
  ["England", "Nigeria", 2, 1],
  ["Croatia", "Egypt", 1, 0],
  ["Germany", "South Korea", 2, 1],
  ["Japan", "Paraguay", 2, 0],
  ["Spain", "Cape Verde", 3, 0],
  ["Colombia", "Uzbekistan", 2, 0],
];

const R16: RawResult[] = [
  ["Brazil", "Uruguay", 2, 0],
  ["Netherlands", "Senegal", 3, 1],
  ["Argentina", "Mexico", 2, 1],
  ["Portugal", "Morocco", 1, 0],
  ["France", "Poland", 3, 0],
  ["England", "Croatia", 2, 1],
  ["Germany", "Japan", 4, 2],
  ["Spain", "Colombia", 3, 1],
];

const QF: RawResult[] = [
  ["Brazil", "Netherlands", 2, 0],
  ["Argentina", "Portugal", 1, 0],
  ["France", "England", 2, 1],
  ["Germany", "Spain", 3, 2],
];

const SF: RawResult[] = [
  ["Brazil", "Argentina", 3, 1],
  ["France", "Germany", 2, 1],
];

const THIRD: RawResult[] = [["Argentina", "Germany", 2, 0]];
const FINAL: RawResult[] = [["Brazil", "France", 2, 1]];

const ROUND_START_DATE: Record<RoundKey, string> = {
  R32: "2026-06-30",
  R16: "2026-07-04",
  QF: "2026-07-09",
  SF: "2026-07-14",
  THIRD: "2026-07-18",
  F: "2026-07-19",
};

const KICKOFF_HOURS_UTC = [15, 18, 21];

let venueCounter = 0;
function nextVenue(): string {
  const v = VENUES[venueCounter % VENUES.length];
  venueCounter += 1;
  return v;
}

function kickoffDate(round: RoundKey, index: number): string {
  const start = new Date(`${ROUND_START_DATE[round]}T00:00:00Z`);
  const dayOffset = Math.floor(index / KICKOFF_HOURS_UTC.length);
  const hour = KICKOFF_HOURS_UTC[index % KICKOFF_HOURS_UTC.length];
  start.setUTCDate(start.getUTCDate() + dayOffset);
  start.setUTCHours(hour, 0, 0, 0);
  return start.toISOString();
}

function buildRound(round: RoundKey, results: RawResult[]): Match[] {
  return results.map(([homeTeam, awayTeam, homeScore, awayScore], index) => ({
    id: `demo-${round}-${index}`,
    round,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    date: kickoffDate(round, index),
    venue: nextVenue(),
  }));
}

export function buildFallbackBracket(): Match[] {
  venueCounter = 0;
  return [
    ...buildRound("R32", R32),
    ...buildRound("R16", R16),
    ...buildRound("QF", QF),
    ...buildRound("SF", SF),
    ...buildRound("THIRD", THIRD),
    ...buildRound("F", FINAL),
  ];
}
