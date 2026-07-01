import { motion } from "framer-motion";
import type { Match } from "../types";
import { flagForTeam } from "../utils/flags";
import { getWinner, isPlayed } from "../utils/match";

interface Props {
  match?: Match;
  delay?: number;
}

// A single knockout matchup, drawn as two stacked flag cells the way the poster
// does. An absent match (a not-yet-reached slot) renders as two "?" cells so the
// full bracket skeleton is always visible.
export function BracketTile({ match, delay = 0 }: Props) {
  const winner = match ? getWinner(match) : null;
  const played = match ? isPlayed(match) : false;

  return (
    <motion.div
      className="tile"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.3, delay, type: "spring", stiffness: 200 }}
    >
      <Cell team={match?.homeTeam} score={match?.homeScore ?? null} won={winner === "home"} played={played} />
      <Cell team={match?.awayTeam} score={match?.awayScore ?? null} won={winner === "away"} played={played} />
    </motion.div>
  );
}

function Cell({
  team,
  score,
  won,
  played,
}: {
  team?: string;
  score: number | null;
  won: boolean;
  played: boolean;
}) {
  const known = Boolean(team) && team !== "TBD";
  return (
    <div
      className={`cell${won ? " cell--won" : ""}${known ? "" : " cell--tbd"}`}
      title={known ? team : "To be decided"}
    >
      <span className="cell__flag" aria-label={known ? team : "To be decided"}>
        {known ? flagForTeam(team as string) : "?"}
      </span>
      {played && <span className="cell__score">{score}</span>}
    </div>
  );
}
