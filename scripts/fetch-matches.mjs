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

// Map football-data.org's goal list into our Goal shape, if present. The free
// tier doesn't always include goals; return undefined when there's nothing.
function mapGoals(goals, homeTeamName) {
  if (!Array.isArray(goals) || goals.length === 0) return undefined;
  const mapped = goals.map((g) => ({
    team: g.team?.name === homeTeamName ? "home" : "away",
    scorer: g.scorer?.name ?? "Unknown",
    minute: g.minute ?? null,
    penalty: g.type === "PENALTY" || undefined,
    ownGoal: g.type === "OWN" || undefined,
  }));
  return mapped.length > 0 ? mapped : undefined;
}

// Normalize a team name for cross-source matching (drop accents/punctuation).
function normName(s) {
  return (s ?? "").toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");
}

// Parse TheSportsDB goal-detail strings like "23':Rodrygo;52'+2:Raphinha" into
// our Goal shape. Values can contain HTML, so strip tags first.
function parseGoalDetails(details, team) {
  if (!details || typeof details !== "string") return [];
  return details
    .split(";")
    .map((entry) => {
      const clean = entry.replace(/<[^>]*>/g, "").trim();
      const idx = clean.indexOf(":");
      if (idx === -1) return null;
      const scorer = clean.slice(idx + 1).trim();
      if (!scorer) return null;
      const min = clean.slice(0, idx).match(/\d+/);
      return { team, scorer, minute: min ? Number(min[0]) : null };
    })
    .filter(Boolean);
}

function goalsFromEvent(e, homeTeamName) {
  const homeIsHome = normName(e.strHomeTeam) === normName(homeTeamName);
  const goals = [
    ...parseGoalDetails(e.strHomeGoalDetails, homeIsHome ? "home" : "away"),
    ...parseGoalDetails(e.strAwayGoalDetails, homeIsHome ? "away" : "home"),
  ].sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));
  return goals.length > 0 ? goals : undefined;
}

async function fetchSportsDbEvents() {
  const res = await fetch("https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=4429&s=2026");
  if (!res.ok) throw new Error(`TheSportsDB responded with ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.events) ? data.events : [];
}

// Best-effort: fill in venue and scorer detail from TheSportsDB for matches that
// football-data.org returned without them. Never throws — the live scores stand
// on their own if this secondary source is unavailable.
async function enrichWithSportsDb(matches) {
  try {
    const events = await fetchSportsDbEvents();
    if (events.length === 0) return;
    const byPair = new Map();
    for (const e of events) {
      byPair.set([normName(e.strHomeTeam), normName(e.strAwayTeam)].sort().join("|"), e);
    }
    let venues = 0;
    let scorers = 0;
    for (const m of matches) {
      const e = byPair.get([normName(m.homeTeam), normName(m.awayTeam)].sort().join("|"));
      if (!e) continue;
      if (!m.venue && e.strVenue) {
        m.venue = e.strVenue;
        venues += 1;
      }
      if (!m.goals || m.goals.length === 0) {
        const goals = goalsFromEvent(e, m.homeTeam);
        if (goals) {
          m.goals = goals;
          scorers += 1;
        }
      }
    }
    console.log(`TheSportsDB enrichment: +${venues} venues, +${scorers} scorer lists`);
  } catch (err) {
    console.error(`TheSportsDB enrichment skipped: ${err instanceof Error ? err.message : String(err)}`);
  }
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
  const matches = rawMatches
    .map((m) => {
      const round = normalizeRound(m.stage);
      if (!round) return null;
      const homeName = m.homeTeam?.name ?? "TBD";
      return {
        id: `fd-${m.id}`,
        round,
        homeTeam: homeName,
        awayTeam: m.awayTeam?.name ?? "TBD",
        homeScore: m.score?.fullTime?.home ?? null,
        awayScore: m.score?.fullTime?.away ?? null,
        date: m.utcDate ?? null,
        venue: m.venue ?? null,
        goals: mapGoals(m.goals, homeName),
      };
    })
    .filter(Boolean);

  if (matches.length === 0) {
    const stages = [...new Set(rawMatches.map((m) => m.stage))];
    throw new Error(`No knockout-stage matches yet. Raw stages seen: ${stages.join(", ") || "none"}`);
  }
  return matches;
}

async function fetchTheSportsDb() {
  const events = await fetchSportsDbEvents();
  const matches = events
    .map((e) => {
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
        goals: goalsFromEvent(e, e.strHomeTeam),
      };
    })
    .filter(Boolean);

  if (matches.length === 0) {
    const rounds = [...new Set(events.map((e) => e.strRound))];
    throw new Error(
      `No knockout-stage matches yet (${events.length} total events). Raw rounds seen: ${rounds.join(", ") || "none"}`,
    );
  }
  return matches;
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
      // football-data.org's free tier omits venues and scorers; try to fill them
      // in from TheSportsDB without risking the live scores we already have.
      if (source.name === "football-data.org") {
        await enrichWithSportsDb(matches);
      }
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
