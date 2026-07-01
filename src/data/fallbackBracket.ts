import type { Match, RoundKey, Goal } from "../types";

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

// Illustrative scorer names per nation, used to synthesise goal timelines for the
// demo bracket (this is fictional fallback data — see buildFallbackBracket).
const SCORERS: Record<string, string[]> = {
  Brazil: ["Vinícius Jr.", "Rodrygo", "Raphinha"],
  Ghana: ["Kudus", "J. Ayew", "Semenyo"],
  Uruguay: ["Núñez", "Valverde", "Pellistri"],
  Iraq: ["Aymen Hussein", "Al-Hamadi"],
  Netherlands: ["Gakpo", "Depay", "Simons"],
  Jordan: ["Al-Naimat", "Al-Tamari"],
  Senegal: ["I. Sarr", "Dia", "N. Jackson"],
  Ecuador: ["E. Valencia", "Plata", "Páez"],
  Argentina: ["Messi", "J. Álvarez", "L. Martínez"],
  Panama: ["Fajardo", "Carrasquilla"],
  Mexico: ["R. Jiménez", "Lozano", "H. Sánchez"],
  Tunisia: ["Msakni", "Khazri"],
  Portugal: ["Ronaldo", "B. Fernandes", "L. Félix"],
  Iran: ["Taremi", "Azmoun"],
  Morocco: ["En-Nesyri", "Hakimi", "Ziyech"],
  Canada: ["J. David", "A. Davies", "Larin"],
  France: ["Mbappé", "Griezmann", "Dembélé"],
  Jamaica: ["L. Bailey", "Antonio"],
  Poland: ["Lewandowski", "Zieliński"],
  "Saudi Arabia": ["Al-Dawsari", "Al-Shehri"],
  England: ["Kane", "Bellingham", "Saka"],
  Nigeria: ["Osimhen", "Lookman"],
  Croatia: ["Kramarić", "Modrić", "Perišić"],
  Egypt: ["Salah", "Marmoush"],
  Germany: ["Musiala", "Havertz", "Wirtz"],
  "South Korea": ["Son", "Hwang H-C.", "Lee K-I."],
  Japan: ["Mitoma", "Kubo", "Kamada"],
  Paraguay: ["Almirón", "Sanabria"],
  Spain: ["L. Yamal", "Morata", "D. Olmo"],
  "Cape Verde": ["Bebé", "Djaniny"],
  Colombia: ["L. Díaz", "J. Rodríguez", "Borré"],
  Uzbekistan: ["Shomurodov", "Ashurmatov"],
};

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

// Build a plausible, chronologically-sorted goal timeline that matches the score.
// Deterministic (seeded by match index) so the demo looks the same on every load.
function buildGoals(
  home: string,
  away: string,
  homeScore: number,
  awayScore: number,
  seed: number,
): Goal[] {
  const goals: Goal[] = [];
  const add = (team: "home" | "away", teamName: string, count: number, offset: number) => {
    const roster = SCORERS[teamName] ?? [teamName];
    for (let i = 0; i < count; i++) {
      goals.push({
        team,
        scorer: roster[(seed + i) % roster.length],
        minute: ((seed * 13 + i * 29 + offset) % 87) + 3,
      });
    }
  };
  add("home", home, homeScore, 7);
  add("away", away, awayScore, 41);
  return goals.sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));
}

let goalSeed = 0;

function buildRound(round: RoundKey, results: RawResult[]): Match[] {
  return results.map(([homeTeam, awayTeam, homeScore, awayScore], index) => {
    goalSeed += 1;
    return {
      id: `demo-${round}-${index}`,
      round,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      date: kickoffDate(round, index),
      venue: nextVenue(),
      goals: buildGoals(homeTeam, awayTeam, homeScore, awayScore, goalSeed),
    };
  });
}

export function buildFallbackBracket(): Match[] {
  venueCounter = 0;
  goalSeed = 0;
  return [
    ...buildRound("R32", R32),
    ...buildRound("R16", R16),
    ...buildRound("QF", QF),
    ...buildRound("SF", SF),
    ...buildRound("THIRD", THIRD),
    ...buildRound("F", FINAL),
  ];
}
