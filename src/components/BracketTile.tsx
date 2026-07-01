import { motion } from "framer-motion";
import type { Match } from "../types";
import { flagForTeam } from "../utils/flags";
import { getWinner, isPlayed } from "../utils/match";

interface Props {
  match?: Match;
  delay?: number;
  onSelect?: (match: Match) => void;
}

// A single knockout matchup, drawn as two stacked flag cells the way the poster
// does. An absent match (a not-yet-reached slot) renders as two "?" cells so the
// full bracket skeleton is always visible. Populated tiles are clickable and open
// a detail card with the kickoff time and venue.
export function BracketTile({ match, delay = 0, onSelect }: Props) {
  const winner = match ? getWinner(match) : null;
  const played = match ? isPlayed(match) : false;
  const clickable = Boolean(match && onSelect);

  return (
    <motion.button
      type="button"
      className={`tile${clickable ? " tile--clickable" : ""}`}
      disabled={!clickable}
      onClick={match && onSelect ? () => onSelect(match) : undefined}
      aria-label={
        match
          ? `Match details: ${match.homeTeam} vs ${match.awayTeam}`
          : "Match to be decided"
      }
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.3, delay, type: "spring", stiffness: 200 }}
      whileHover={clickable ? { scale: 1.06 } : undefined}
      whileTap={clickable ? { scale: 0.97 } : undefined}
    >
      <Cell team={match?.homeTeam} score={match?.homeScore ?? null} won={winner === "home"} played={played} />
      <Cell team={match?.awayTeam} score={match?.awayScore ?? null} won={winner === "away"} played={played} />
    </motion.button>
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
