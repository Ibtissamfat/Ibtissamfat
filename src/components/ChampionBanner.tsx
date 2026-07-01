import { motion } from "framer-motion";
import type { Match } from "../types";
import { flagForTeam } from "../utils/flags";
import { getWinner } from "../utils/match";

export function ChampionBanner({ finalMatch }: { finalMatch: Match | undefined }) {
  const winner = finalMatch ? getWinner(finalMatch) : null;
  if (!finalMatch || !winner) return null;

  const championName = winner === "home" ? finalMatch.homeTeam : finalMatch.awayTeam;

  return (
    <motion.div
      className="champion-banner"
      initial={{ opacity: 0, scale: 0.7, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.3 }}
    >
      <motion.span
        className="champion-banner__trophy"
        animate={{ rotate: [0, -8, 8, -8, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.5 }}
      >
        🏆
      </motion.span>
      <span>
        {flagForTeam(championName)} <strong>{championName}</strong> are World Champions!
      </span>
    </motion.div>
  );
}
