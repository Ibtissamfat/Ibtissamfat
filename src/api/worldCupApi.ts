import type { Match, WorldCupData } from "../types";
import { normalizeRound } from "../utils/rounds";
import { buildFallbackBracket } from "../data/fallbackBracket";

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

async function fetchLiveMatches(): Promise<Match[]> {
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

export async function loadWorldCupData(): Promise<WorldCupData> {
  try {
    const matches = await fetchLiveMatches();
    return { source: "live", fetchedAt: new Date().toISOString(), matches };
  } catch {
    return {
      source: "demo",
      fetchedAt: new Date().toISOString(),
      matches: buildFallbackBracket(),
    };
  }
}
