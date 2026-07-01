import { motion } from "framer-motion";
import type { Match } from "../types";
import { flagForTeam } from "../utils/flags";
import { getWinner, isPlayed } from "../utils/match";
import { formatMatchDateTime } from "../utils/date";

interface Props {
  match: Match;
  delay?: number;
}

export function MatchCard({ match, delay = 0 }: Props) {
  const winner = getWinner(match);
  const played = isPlayed(match);
  const kickoff = formatMatchDateTime(match.date);

  return (
    <motion.div
      className="match-card"
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay, type: "spring", stiffness: 140 }}
      whileHover={{ scale: 1.04, rotate: -0.5 }}
    >
      <TeamRow
        team={match.homeTeam}
        score={match.homeScore}
        isWinner={winner === "home"}
        played={played}
      />
      <div className="match-card__vs">
        {played ? (
          <span className="match-card__ft">FT</span>
        ) : kickoff ? (
          <span className="match-card__kickoff">🕒 {kickoff}</span>
        ) : (
          <span className="match-card__vs-label">VS</span>
        )}
      </div>
      <TeamRow
        team={match.awayTeam}
        score={match.awayScore}
        isWinner={winner === "away"}
        played={played}
      />
      {(match.venue || (played && kickoff)) && (
        <div className="match-card__meta">
          {match.venue && <span>📍 {match.venue}</span>}
          {played && kickoff && <span>🕒 {kickoff}</span>}
        </div>
      )}
    </motion.div>
  );
}

function TeamRow({
  team,
  score,
  isWinner,
  played,
}: {
  team: string;
  score: number | null;
  isWinner: boolean;
  played: boolean;
}) {
  return (
    <div className={`team-row${isWinner ? " team-row--winner" : ""}`}>
      <span className="team-row__flag">{flagForTeam(team)}</span>
      <span className="team-row__name">{team}</span>
      <span className="team-row__score">{played ? score : "–"}</span>
      {isWinner && (
        <motion.span
          className="team-row__badge"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.15 }}
        >
          ✅
        </motion.span>
      )}
    </div>
  );
}
