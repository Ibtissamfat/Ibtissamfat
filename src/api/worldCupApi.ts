import type { WorldCupData } from "../types";
import { buildFallbackBracket } from "../data/fallbackBracket";

// The actual live fetch happens server-side (scripts/fetch-matches.mjs, run in
// CI) and is published as this static file. Fetching football-data.org
// directly from the browser doesn't work: it doesn't allow CORS for direct
// browser calls, and shipping an API key in a client bundle would expose it.
const DATA_URL = `${import.meta.env.BASE_URL}data/worldcup.json`;

export async function loadWorldCupData(): Promise<WorldCupData> {
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${DATA_URL} (${res.status})`);
    const data: WorldCupData = await res.json();

    if (data.source === "live" && data.matches.length > 0) {
      return data;
    }

    // The CI fetch ran but no live source worked; keep its error messages so
    // "Why demo data?" still explains what actually happened.
    return { ...data, source: "demo", sourceName: null, matches: buildFallbackBracket() };
  } catch (err) {
    return {
      source: "demo",
      sourceName: null,
      fetchedAt: new Date().toISOString(),
      matches: buildFallbackBracket(),
      errors: [{ source: "data/worldcup.json", message: err instanceof Error ? err.message : String(err) }],
    };
  }
}
