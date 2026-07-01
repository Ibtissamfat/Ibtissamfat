import type { Match } from "../types";

export type WinnerSide = "home" | "away" | null;

export function getWinner(match: Match): WinnerSide {
  if (match.homeScore === null || match.awayScore === null) return null;
  if (match.homeScore !== match.awayScore) {
    return match.homeScore > match.awayScore ? "home" : "away";
  }
  // Level after normal/extra time: the tie is settled on penalties, if known.
  if (match.homePens != null && match.awayPens != null && match.homePens !== match.awayPens) {
    return match.homePens > match.awayPens ? "home" : "away";
  }
  return null;
}

export function wentToPenalties(match: Match): boolean {
  return match.homePens != null && match.awayPens != null;
}

export function isPlayed(match: Match): boolean {
  return match.homeScore !== null && match.awayScore !== null;
}
