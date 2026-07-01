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

// Note: mapping raw provider stage names (e.g. "QUARTER_FINALS") onto RoundKey
// happens server-side in scripts/fetch-matches.mjs, which is the single source
// of that rule. The app only ever reads the already-normalized JSON, so it
// deliberately doesn't carry its own normalizer.
