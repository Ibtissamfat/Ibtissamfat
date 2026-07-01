import type { RoundKey } from "../types";

export const ROUND_ORDER: RoundKey[] = ["R32", "R16", "QF", "SF", "THIRD", "F"];

export const ROUND_LABEL: Record<RoundKey, string> = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-Finals",
  SF: "Semi-Finals",
  THIRD: "Third-Place Play-off",
  F: "Final",
};

export const ROUND_EMOJI: Record<RoundKey, string> = {
  R32: "🔥",
  R16: "⚡",
  QF: "🌟",
  SF: "🚀",
  THIRD: "🥉",
  F: "🏆",
};

export function normalizeRound(raw: string): RoundKey | null {
  const s = raw.trim().toLowerCase().replace(/_/g, " ");
  if (/round of 32|last 32/.test(s)) return "R32";
  if (/round of 16|last 16/.test(s)) return "R16";
  if (/quarter/.test(s)) return "QF";
  if (/semi/.test(s)) return "SF";
  if (/3rd|third/.test(s)) return "THIRD";
  if (/final/.test(s)) return "F";
  return null;
}
