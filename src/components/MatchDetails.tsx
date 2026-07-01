import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Match } from "../types";
import { flagForTeam } from "../utils/flags";
import { getWinner, isPlayed } from "../utils/match";
import { formatMatchDateTime } from "../utils/date";
import { ROUND_LABEL, ROUND_EMOJI } from "../utils/rounds";

interface Props {
  match: Match | null;
  onClose: () => void;
}

// Click-through card for a single match: round, teams and score, kickoff, venue,
// and the full goal timeline with scorers.
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
            aria-label={`${match.homeTeam} versus ${match.awayTeam} details`}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <button className="details__close" onClick={onClose} aria-label="Close details">
              ✕
            </button>

            <p className="details__round">
              {ROUND_EMOJI[match.round]} {ROUND_LABEL[match.round]}
            </p>

            <div className="details__score">
              <TeamCol team={match.homeTeam} won={getWinner(match) === "home"} />
              <div className="details__numbers">
                {isPlayed(match) ? (
                  <span>
                    {match.homeScore}<span className="details__dash">–</span>{match.awayScore}
                  </span>
                ) : (
                  <span className="details__vs">VS</span>
                )}
              </div>
              <TeamCol team={match.awayTeam} won={getWinner(match) === "away"} />
            </div>

            <Goals match={match} />

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

function TeamCol({ team, won }: { team: string; won: boolean }) {
  return (
    <div className={`details__team${won ? " details__team--won" : ""}`}>
      <span className="details__flag">{flagForTeam(team)}</span>
      <span className="details__name">{team}</span>
    </div>
  );
}

function Goals({ match }: { match: Match }) {
  if (!isPlayed(match)) return null;
  const goals = match.goals ?? [];

  if (goals.length === 0) {
    return <p className="details__nogoals">⚽ Goalless — no scorers on record.</p>;
  }

  return (
    <div className="goals">
      <p className="goals__title">⚽ Goals</p>
      <ul className="goals__list">
        {goals.map((g, i) => {
          const team = g.team === "home" ? match.homeTeam : match.awayTeam;
          return (
            <li key={i} className={`goal goal--${g.team}`}>
              <span className="goal__min">{g.minute != null ? `${g.minute}'` : ""}</span>
              <span className="goal__flag">{flagForTeam(team)}</span>
              <span className="goal__scorer">
                {g.scorer}
                {g.penalty && <span className="goal__tag"> (pen)</span>}
                {g.ownGoal && <span className="goal__tag"> (OG)</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
