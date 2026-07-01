import type { Match } from "../types";

export type WinnerSide = "home" | "away" | null;

export function getWinner(match: Match): WinnerSide {
  if (match.homeScore === null || match.awayScore === null) return null;
  if (match.homeScore === match.awayScore) return null;
  return match.homeScore > match.awayScore ? "home" : "away";
}

export function isPlayed(match: Match): boolean {
  return match.homeScore !== null && match.awayScore !== null;
}
