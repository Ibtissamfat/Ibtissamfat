import { useEffect } from "react";
import confetti from "canvas-confetti";
import type { Match } from "../types";
import { getWinner } from "../utils/match";

export function useChampionConfetti(finalMatch: Match | undefined) {
  const winner = finalMatch ? getWinner(finalMatch) : null;

  useEffect(() => {
    if (!finalMatch || !winner) return;

    const duration = 2200;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 65,
        origin: { x: 0, y: 0.7 },
        colors: ["#FFD700", "#00A651", "#0072CE"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 65,
        origin: { x: 1, y: 0.7 },
        colors: ["#FFD700", "#00A651", "#0072CE"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };

    const timer = setTimeout(frame, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refire only when the result actually changes, not on every poll
  }, [finalMatch?.id, winner]);
}
