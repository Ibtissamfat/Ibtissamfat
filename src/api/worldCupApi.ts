import type { Match, WorldCupData } from "../types";
import { normalizeRound } from "../utils/rounds";
import { buildFallbackBracket } from "../data/fallbackBracket";
import { fetchFootballDataMatches } from "./footballDataApi";

const FIFA_WORLD_CUP_LEAGUE_ID = "4429";
const SEASON = "2026";
const API_BASE = "https://www.thesportsdb.com/api/v1/json/3";

interface RawEvent {
  idEvent: string;
  strRound: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string | null;
  strVenue: string | null;
}

function transformEvent(e: RawEvent): Match | null {
  const round = normalizeRound(e.strRound ?? "");
  if (!round) return null;
  return {
    id: e.idEvent,
    round,
    homeTeam: e.strHomeTeam,
    awayTeam: e.strAwayTeam,
    homeScore: e.intHomeScore !== null && e.intHomeScore !== "" ? Number(e.intHomeScore) : null,
    awayScore: e.intAwayScore !== null && e.intAwayScore !== "" ? Number(e.intAwayScore) : null,
    date: e.dateEvent,
    venue: e.strVenue,
  };
}

async function fetchTheSportsDbMatches(): Promise<Match[]> {
  const url = `${API_BASE}/eventsseason.php?id=${FIFA_WORLD_CUP_LEAGUE_ID}&s=${SEASON}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`API responded with ${res.status}`);
    const data = await res.json();
    const events: RawEvent[] = Array.isArray(data?.events) ? data.events : [];
    const matches = events
      .map(transformEvent)
      .filter((m): m is Match => m !== null);

    if (matches.length === 0) {
      throw new Error("No knockout-stage matches found in live data yet");
    }
    return matches;
  } finally {
    clearTimeout(timeout);
  }
}

// Tried in order: an accurate but key-gated source first, then a keyless
// fallback that's historically been unreliable for this data, then the
// bundled demo bracket so the app always has something to show.
const LIVE_SOURCES: { name: string; fetch: () => Promise<Match[]> }[] = [
  { name: "football-data.org", fetch: fetchFootballDataMatches },
  { name: "TheSportsDB", fetch: fetchTheSportsDbMatches },
];

export async function loadWorldCupData(): Promise<WorldCupData> {
  const errors: { source: string; message: string }[] = [];

  for (const source of LIVE_SOURCES) {
    try {
      const matches = await source.fetch();
      return { source: "live", sourceName: source.name, fetchedAt: new Date().toISOString(), matches, errors };
    } catch (err) {
      errors.push({ source: source.name, message: err instanceof Error ? err.message : String(err) });
    }
  }

  return {
    source: "demo",
    sourceName: null,
    fetchedAt: new Date().toISOString(),
    matches: buildFallbackBracket(),
    errors,
  };
}
