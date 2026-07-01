import type { Match } from "../types";
import { normalizeRound } from "../utils/rounds";

const BASE = "https://api.football-data.org/v4";
const WORLD_CUP_COMPETITION_CODE = "WC";

interface RawTeam {
  name: string;
}

interface RawScoreFullTime {
  home: number | null;
  away: number | null;
}

interface RawMatch {
  id: number;
  stage: string;
  utcDate: string;
  homeTeam: RawTeam;
  awayTeam: RawTeam;
  score: { fullTime: RawScoreFullTime };
  venue: string | null;
}

function transformMatch(m: RawMatch): Match | null {
  const round = normalizeRound(m.stage ?? "");
  if (!round) return null;
  return {
    id: `fd-${m.id}`,
    round,
    homeTeam: m.homeTeam.name,
    awayTeam: m.awayTeam.name,
    homeScore: m.score.fullTime.home,
    awayScore: m.score.fullTime.away,
    date: m.utcDate,
    venue: m.venue,
  };
}

export async function fetchFootballDataMatches(): Promise<Match[]> {
  const apiKey = import.meta.env.VITE_FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_FOOTBALL_DATA_API_KEY is not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${BASE}/competitions/${WORLD_CUP_COMPETITION_CODE}/matches`, {
      headers: { "X-Auth-Token": apiKey },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`football-data.org responded with ${res.status}`);

    const data = await res.json();
    const rawMatches: RawMatch[] = Array.isArray(data?.matches) ? data.matches : [];
    const matches = rawMatches.map(transformMatch).filter((m): m is Match => m !== null);

    if (matches.length === 0) {
      throw new Error("No knockout-stage matches found yet from football-data.org");
    }
    return matches;
  } finally {
    clearTimeout(timeout);
  }
}
