import type { SeatNumber } from "../shared/SeatNumber";
import type { SeatClock } from "../shared/SeatClock";
import { decisionOf } from "./decisionOf";
import { epochMsAfter } from "./epochMsAfter";
import type { GameState } from "./GameState";
import { seatOf } from "./seatOf";

export function decisionClockOf(state: GameState, seatNumber: SeatNumber): SeatClock | null {
  const bankMs = seatOf(state, seatNumber)?.timeBankMs ?? 0;
  const decision = decisionOf(state, seatNumber);
  if (state.pause !== null || decision === null) {
    return null;
  }
  const grace = state.grace.find((entry) => entry.seat === seatNumber);
  if (grace !== undefined) {
    const until = epochMsAfter(grace.until, 0);
    return { bankMs, freeUntil: until, deadline: until };
  }
  const { startedAt, freeMs, limitMs } = decision;
  return {
    bankMs,
    freeUntil: epochMsAfter(startedAt, freeMs),
    deadline: epochMsAfter(startedAt, Math.min(limitMs, freeMs + bankMs)),
  };
}
