import { decisionClockOf } from "./decisionClockOf";
import type { GameState } from "./GameState";
import { pausedAbandonDeadline } from "./pausedAbandonDeadline";
import { voteDeadlineOf } from "./voteDeadlineOf";

function earlierOf(first: number | null, second: number | null): number | null {
  if (first === null || second === null) {
    return first ?? second;
  }
  return Math.min(first, second);
}

export function earliestDeadline(state: GameState): number | null {
  return state.seats.reduce<number | null>(
    (earliest, seat) => earlierOf(earliest, decisionClockOf(state, seat.seat)?.deadline ?? null),
    earlierOf(pausedAbandonDeadline(state), voteDeadlineOf(state)),
  );
}
