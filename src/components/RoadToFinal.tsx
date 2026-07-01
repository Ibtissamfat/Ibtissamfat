import { useMemo, useState } from "react";
import type { Match, RoundKey } from "../types";
import { ROUND_ORDER } from "../utils/rounds";
import { RoundSection } from "./RoundSection";
import { ChampionBanner } from "./ChampionBanner";
import { MatchDetails } from "./MatchDetails";
import { useChampionConfetti } from "../hooks/useChampionConfetti";

interface Props {
  matches: Match[];
}

export function RoadToFinal({ matches }: Props) {
  const grouped = useMemo(() => {
    const map = new Map<RoundKey, Match[]>();
    for (const round of ROUND_ORDER) {
      const roundMatches = matches.filter((m) => m.round === round);
      if (roundMatches.length > 0) map.set(round, roundMatches);
    }
    return map;
  }, [matches]);

  const [selected, setSelected] = useState<Match | null>(null);

  const orderedRounds = ROUND_ORDER.filter((r) => grouped.has(r));
  const finalMatch = grouped.get("F")?.[0];

  useChampionConfetti(finalMatch);

  if (orderedRounds.length === 0) {
    return (
      <div className="empty-state">
        <p>⚽ No knockout-stage matches yet. Check back once the group stage wraps up!</p>
      </div>
    );
  }

  return (
    <div className="road-to-final">
      <ChampionBanner finalMatch={finalMatch} />
      {orderedRounds.map((round, i) => (
        <RoundSection
          key={round}
          round={round}
          matches={grouped.get(round) ?? []}
          stepNumber={i + 1}
          totalSteps={orderedRounds.length}
          onSelect={setSelected}
        />
      ))}
      <MatchDetails match={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
