import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Match } from "../types";
import { flagForTeam } from "../utils/flags";
import { getWinner } from "../utils/match";
import { formatMatchDateTime } from "../utils/date";
import { ROUND_LABEL, ROUND_EMOJI } from "../utils/rounds";

interface Props {
  match: Match | null;
  onClose: () => void;
}

// A tap-through card for a single match: round, both teams with scores, and the
// kickoff time and venue that don't fit on the compact bracket tile.
export function MatchDetails({ match, onClose }: Props) {
  useEffect(() => {
    if (!match) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [match, onClose]);

  return (
    <AnimatePresence>
      {match && (
        <motion.div
          className="details-backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="details"
            role="dialog"
            aria-modal="true"
            aria-label="Match details"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <button className="details__close" onClick={onClose} aria-label="Close match details">
              ✕
            </button>

            <p className="details__round">
              {ROUND_EMOJI[match.round]} {ROUND_LABEL[match.round]}
            </p>

            <div className="details__teams">
              <TeamLine team={match.homeTeam} score={match.homeScore} won={getWinner(match) === "home"} />
              <span className="details__sep">{isDecided(match) ? "" : "vs"}</span>
              <TeamLine team={match.awayTeam} score={match.awayScore} won={getWinner(match) === "away"} />
            </div>

            <dl className="details__meta">
              <div className="details__row">
                <dt>🕒 Kickoff</dt>
                <dd>{formatMatchDateTime(match.date) ?? "To be scheduled"}</dd>
              </div>
              <div className="details__row">
                <dt>📍 Venue</dt>
                <dd>{match.venue ?? "To be announced"}</dd>
              </div>
            </dl>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function isDecided(match: Match): boolean {
  return match.homeScore !== null && match.awayScore !== null;
}

function TeamLine({ team, score, won }: { team: string; score: number | null; won: boolean }) {
  const known = Boolean(team) && team !== "TBD";
  return (
    <div className={`team-line${won ? " team-line--won" : ""}`}>
      <span className="team-line__flag">{known ? flagForTeam(team) : "?"}</span>
      <span className="team-line__name">{known ? team : "To be decided"}</span>
      <span className="team-line__score">{score ?? "–"}</span>
    </div>
  );
}
