#!/usr/bin/env node
// Runs server-side (locally or in CI) to avoid two problems a static
// browser-only app can't solve: football-data.org blocks direct browser
// fetches via CORS, and shipping an API key in a client bundle exposes it.
// Output is a plain JSON file the frontend fetches same-origin.
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

function normalizeRound(raw) {
  const s = (raw ?? "").trim().toLowerCase().replace(/_/g, " ");
  if (/round of 32|last 32/.test(s)) return "R32";
  if (/round of 16|last 16/.test(s)) return "R16";
  if (/quarter/.test(s)) return "QF";
  if (/semi/.test(s)) return "SF";
  if (/3rd|third/.test(s)) return "THIRD";
  if (/final/.test(s)) return "F";
  return null;
}

// Map each provider's raw rows into our Match shape, dropping anything that
// isn't a recognizable knockout round. Throws a source-specific diagnostic when
// nothing usable is found, so the frontend's "Why demo data?" can explain why.
function collectKnockoutMatches(rawRows, mapRow, describeEmpty) {
  const matches = rawRows.map(mapRow).filter(Boolean);
  if (matches.length === 0) throw new Error(describeEmpty(rawRows));
  return matches;
}

async function fetchFootballData() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) throw new Error("FOOTBALL_DATA_API_KEY is not set");

  const res = await fetch("https://api.football-data.org/v4/competitions/WC/matches", {
    headers: { "X-Auth-Token": apiKey },
  });
  if (!res.ok) throw new Error(`football-data.org responded with ${res.status}`);

  const data = await res.json();
  const rawMatches = Array.isArray(data?.matches) ? data.matches : [];
  return collectKnockoutMatches(
    rawMatches,
    (m) => {
      const round = normalizeRound(m.stage);
      if (!round) return null;
      return {
        id: `fd-${m.id}`,
        round,
        homeTeam: m.homeTeam?.name ?? "TBD",
        awayTeam: m.awayTeam?.name ?? "TBD",
        homeScore: m.score?.fullTime?.home ?? null,
        awayScore: m.score?.fullTime?.away ?? null,
        date: m.utcDate ?? null,
        venue: m.venue ?? null,
      };
    },
    (rows) => {
      const stages = [...new Set(rows.map((m) => m.stage))];
      return `No knockout-stage matches yet. Raw stages seen: ${stages.join(", ") || "none"}`;
    },
  );
}

async function fetchTheSportsDb() {
  const res = await fetch("https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=4429&s=2026");
  if (!res.ok) throw new Error(`TheSportsDB responded with ${res.status}`);

  const data = await res.json();
  const events = Array.isArray(data?.events) ? data.events : [];
  return collectKnockoutMatches(
    events,
    (e) => {
      const round = normalizeRound(e.strRound);
      if (!round) return null;
      return {
        id: e.idEvent,
        round,
        homeTeam: e.strHomeTeam,
        awayTeam: e.strAwayTeam,
        homeScore: e.intHomeScore !== null && e.intHomeScore !== "" ? Number(e.intHomeScore) : null,
        awayScore: e.intAwayScore !== null && e.intAwayScore !== "" ? Number(e.intAwayScore) : null,
        date: e.dateEvent ?? null,
        venue: e.strVenue ?? null,
      };
    },
    (rows) => {
      const rounds = [...new Set(rows.map((e) => e.strRound))];
      return `No knockout-stage matches yet (${rows.length} total events). Raw rounds seen: ${rounds.join(", ") || "none"}`;
    },
  );
}

const SOURCES = [
  { name: "football-data.org", fetch: fetchFootballData },
  { name: "TheSportsDB", fetch: fetchTheSportsDb },
];

async function main() {
  const errors = [];
  let result = null;

  for (const source of SOURCES) {
    try {
      const matches = await source.fetch();
      result = { source: "live", sourceName: source.name, fetchedAt: new Date().toISOString(), matches, errors };
      console.log(`Loaded ${matches.length} matches from ${source.name}`);
      break;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`${source.name} failed: ${message}`);
      errors.push({ source: source.name, message });
    }
  }

  if (!result) {
    result = { source: "demo", sourceName: null, fetchedAt: new Date().toISOString(), matches: [], errors };
    console.log("No live source available; frontend will fall back to its bundled demo bracket.");
  }

  const outDir = path.join(process.cwd(), "public", "data");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "worldcup.json");
  await writeFile(outPath, JSON.stringify(result, null, 2));
  console.log(`Wrote ${outPath}`);
}

main();
