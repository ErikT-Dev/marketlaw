import type { SeatNumber } from "../shared/SeatNumber";
import type { Decision } from "./Decision";
import type { GameState } from "./GameState";
import { isInOwnMainPhase } from "./isInOwnMainPhase";
import { mainPhaseLimitMs } from "./mainPhaseLimitMs";
import { marketGoOf } from "./marketGoOf";
import { seatOf } from "./seatOf";
import { TIME_RULES } from "./TIME_RULES";

export function decisionOf(state: GameState, seatNumber: SeatNumber): Decision | null {
  const seat = seatOf(state, seatNumber);
  if (seat === undefined || seat.departure !== null) {
    return null;
  }
  if (marketGoOf(state) === seatNumber) {
    return {
      startedAt: state.clockStartedAt,
      freeMs: TIME_RULES.goFreeMs,
      limitMs: TIME_RULES.goLimitMs,
    };
  }
  const isPlaying = isInOwnMainPhase(state, seat) && !seat.isDone && !seat.isOutOfTime;
  return isPlaying && seat.mainPhaseStartedAt !== null
    ? {
        startedAt: seat.mainPhaseStartedAt,
        freeMs: TIME_RULES.mainFreeMs,
        limitMs: mainPhaseLimitMs(state.turn),
      }
    : null;
}
