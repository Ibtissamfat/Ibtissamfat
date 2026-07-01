import { useMemo, useState } from "react";
import type { Match, RoundKey } from "../types";
import { BracketTile } from "./BracketTile";
import { MatchDetails } from "./MatchDetails";
import { getWinner } from "../utils/match";
import { flagForTeam } from "../utils/flags";
import { useChampionConfetti } from "../hooks/useChampionConfetti";

interface Props {
  matches: Match[];
}

// Rounds fan out from the centre. Each side shows the same rounds, so the left
// reads outer -> inner and the right is mirrored.
const LEFT_ROUNDS: RoundKey[] = ["R32", "R16", "QF", "SF"];
const RIGHT_ROUNDS: RoundKey[] = ["SF", "QF", "R16", "R32"];

// How many matchups each round places on a single side of the bracket. Used to
// pad partially-known rounds with "?" placeholders so the skeleton is complete.
const PER_SIDE: Record<RoundKey, number> = { R32: 8, R16: 4, QF: 2, SF: 1, THIRD: 1, F: 1 };

function pad(list: Match[], count: number): (Match | undefined)[] {
  if (list.length >= count) return list.slice(0, count);
  return [...list, ...Array<undefined>(count - list.length).fill(undefined)];
}

export function Bracket({ matches }: Props) {
  const byRound = useMemo(() => {
    const map = new Map<RoundKey, Match[]>();
    for (const m of matches) {
      const list = map.get(m.round) ?? [];
      list.push(m);
      map.set(m.round, list);
    }
    return map;
  }, [matches]);

  // First half of each round feeds the left side, second half the right.
  const sides = useMemo(() => {
    const left = {} as Record<RoundKey, (Match | undefined)[]>;
    const right = {} as Record<RoundKey, (Match | undefined)[]>;
    for (const round of LEFT_ROUNDS) {
      const all = byRound.get(round) ?? [];
      const perSide = PER_SIDE[round];
      left[round] = pad(all.slice(0, Math.ceil(all.length / 2)), perSide);
      right[round] = pad(all.slice(Math.ceil(all.length / 2)), perSide);
    }
    return { left, right };
  }, [byRound]);

  const [selected, setSelected] = useState<Match | null>(null);

  const finalMatch = byRound.get("F")?.[0];
  const thirdMatch = byRound.get("THIRD")?.[0];

  useChampionConfetti(finalMatch);

  const finalWinner = finalMatch ? getWinner(finalMatch) : null;
  const champion = finalWinner
    ? finalWinner === "home"
      ? finalMatch?.homeTeam
      : finalMatch?.awayTeam
    : undefined;

  if (matches.length === 0) {
    return (
      <div className="empty-state">
        <p>⚽ No knockout-stage matches yet. Check back once the group stage wraps up!</p>
      </div>
    );
  }

  return (
    <div className="bracket-scroll">
      <div className="bracket">
        <div className="bracket__side bracket__side--left">
          {LEFT_ROUNDS.map((round) => (
            <Column key={`l-${round}`} side="left" tiles={sides.left[round]} onSelect={setSelected} />
          ))}
        </div>

        <div className="bracket__center">
          <div className="center-top">
            <div className="champion">
              <p className="champion__label">WORLD CHAMPION</p>
              <div className={`champion-tile${champion ? " champion-tile--won" : ""}`}>
                <span aria-label={champion ?? "To be decided"}>
                  {champion ? flagForTeam(champion) : "?"}
                </span>
              </div>
            </div>
          </div>

          <div className="center-mid">
            <BracketTile match={finalMatch} onSelect={setSelected} />
          </div>

          <div className="center-bot">
            <div className="bronze">
              <p className="bronze__label">BRONZE FINAL</p>
              <BracketTile match={thirdMatch} onSelect={setSelected} />
            </div>
            <div className="trophy">
              <span className="trophy__cup" role="img" aria-label="World Cup trophy">🏆</span>
              <span className="trophy__mark">
                <strong>26</strong> FIFA WORLD CUP 2026
              </span>
            </div>
          </div>
        </div>

        <div className="bracket__side bracket__side--right">
          {RIGHT_ROUNDS.map((round) => (
            <Column key={`r-${round}`} side="right" tiles={sides.right[round]} onSelect={setSelected} />
          ))}
        </div>
      </div>

      <MatchDetails match={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function Column({
  side,
  tiles,
  onSelect,
}: {
  side: "left" | "right";
  tiles: (Match | undefined)[];
  onSelect: (match: Match) => void;
}) {
  return (
    <div className={`round round--${side}`}>
      {tiles.map((match, i) => (
        <div className="seed" key={match?.id ?? `slot-${i}`}>
          <BracketTile match={match} delay={i * 0.04} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
}
