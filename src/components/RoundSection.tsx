import { motion } from "framer-motion";
import type { Match, RoundKey } from "../types";
import { ROUND_LABEL, ROUND_EMOJI } from "../utils/rounds";
import { MatchCard } from "./MatchCard";

interface Props {
  round: RoundKey;
  matches: Match[];
  stepNumber: number;
  totalSteps: number;
}

export function RoundSection({ round, matches, stepNumber, totalSteps }: Props) {
  return (
    <div className="round-section">
      <div className="round-section__spine">
        <motion.div
          className="round-section__node"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
        >
          {ROUND_EMOJI[round]}
        </motion.div>
        {stepNumber < totalSteps && <div className="round-section__line" />}
      </div>

      <div className="round-section__content">
        <motion.h2
          className="round-section__title"
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4 }}
        >
          {ROUND_LABEL[round]}
        </motion.h2>
        <div className="round-section__grid">
          {matches.map((m, i) => (
            <MatchCard key={m.id} match={m} delay={i * 0.06} />
          ))}
        </div>
      </div>
    </div>
  );
}
