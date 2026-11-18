import type { SeatNumber } from "../shared/SeatNumber";
import { bankLeftAt } from "../shared/bankLeftAt";
import { decisionClockOf } from "./decisionClockOf";
import type { GameState } from "./GameState";
import { TIME_BANK_MS } from "./TIME_BANK_MS";

export function bankAfterEndingTurn(state: GameState, seat: SeatNumber, at: number): number | null {
  const clock = decisionClockOf(state, seat);
  if (clock === null) {
    return null;
  }
  const hasFreeTimeAgain = state.grace.some((entry) => entry.seat === seat);
  const unusedFreeMs = hasFreeTimeAgain ? 0 : Math.max(0, clock.freeUntil - at);
  return Math.min(TIME_BANK_MS, bankLeftAt(clock, at) + unusedFreeMs);
}
