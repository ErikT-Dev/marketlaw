import type { SeatNumber } from "../shared/SeatNumber";
import type { SeatClock } from "../shared/SeatClock";
import { epochMsAfter } from "./epochMsAfter";
import type { GameState } from "./GameState";
import { mainPhaseLimitMs } from "./mainPhaseLimitMs";
import { marketGoOf } from "./marketGoOf";
import { seatOf } from "./seatOf";
import { TIME_RULES } from "./TIME_RULES";

function limitsOf(state: GameState, seat: SeatNumber) {
  if (state.phase === "main") {
    return { freeMs: TIME_RULES.mainFreeMs, limitMs: mainPhaseLimitMs(state.turn) };
  }
  const limitMs =
    seat === state.firstPlayer ? TIME_RULES.firstGoLimitMs : TIME_RULES.goLimitMs;
  return { freeMs: TIME_RULES.goFreeMs, limitMs };
}

function isDeciding(state: GameState, seatNumber: SeatNumber): boolean {
  const seat = seatOf(state, seatNumber);
  if (seat === undefined || seat.hasLeft) {
    return false;
  }
  switch (state.phase) {
    case "main":
      return !seat.isDone;
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
  if (state.grace?.seat === seatNumber) {
    const until = epochMsAfter(state.grace.until, 0);
    return { bankMs, freeUntil: until, deadline: until };
  }
  const { freeMs, limitMs } = limitsOf(state, seatNumber);
  return {
    bankMs,
    freeUntil: epochMsAfter(state.clockStartedAt, freeMs),
    deadline: epochMsAfter(state.clockStartedAt, Math.min(limitMs, freeMs + bankMs)),
  };
}
