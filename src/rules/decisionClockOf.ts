import type { SeatNumber } from "../shared/SeatNumber";
import type { SeatClock } from "../shared/SeatClock";
import { epochMsAfter } from "./epochMsAfter";
import type { GameState } from "./GameState";
import { mainPhaseLimitMs } from "./mainPhaseLimitMs";
import { marketGoOf } from "./marketGoOf";
import { seatOf } from "./seatOf";
import { TIME_RULES } from "./TIME_RULES";

function limitsOf(state: GameState) {
  if (state.phase === "main") {
    return { freeMs: TIME_RULES.mainFreeMs, limitMs: mainPhaseLimitMs(state.turn) };
  }
  return { freeMs: TIME_RULES.goFreeMs, limitMs: TIME_RULES.goLimitMs };
}

function isDeciding(state: GameState, seatNumber: SeatNumber): boolean {
  const seat = seatOf(state, seatNumber);
  if (seat === undefined || seat.departure !== null) {
    return false;
  }
  switch (state.phase) {
    case "main":
      return !seat.isDone && !seat.isOutOfTime;
    case "market":
      return marketGoOf(state) === seatNumber;
    case "ended":
      return false;
  }
}

export function decisionClockOf(state: GameState, seatNumber: SeatNumber): SeatClock | null {
  const bankMs = seatOf(state, seatNumber)?.timeBankMs ?? 0;
  if (state.pause !== null || !isDeciding(state, seatNumber)) {
    return null;
  }
  const grace = state.grace.find((entry) => entry.seat === seatNumber);
  if (grace !== undefined) {
    const until = epochMsAfter(grace.until, 0);
    return { bankMs, freeUntil: until, deadline: until };
  }
  const { freeMs, limitMs } = limitsOf(state);
  return {
    bankMs,
    freeUntil: epochMsAfter(state.clockStartedAt, freeMs),
    deadline: epochMsAfter(state.clockStartedAt, Math.min(limitMs, freeMs + bankMs)),
  };
}
