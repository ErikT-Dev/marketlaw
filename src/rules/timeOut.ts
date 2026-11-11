import type { SeatNumber } from "../shared/SeatNumber";
import { bankLeftAt } from "../shared/bankLeftAt";
import { decisionClockOf } from "./decisionClockOf";
import { endMainPhaseIfAllDone } from "./endMainPhaseIfAllDone";
import type { GameState } from "./GameState";
import { leaveGame } from "./leaveGame";
import type { Random } from "./Random";
import { seatsLeavingAt } from "./seatsLeavingAt";
import { takeTurnDraw } from "./takeTurnDraw";
import { updateSeat } from "./updateSeat";

function withMainPhaseTimeOutCounted(state: GameState, seat: SeatNumber, at: number): GameState {
  const clock = decisionClockOf(state, seat);
  const isCounted = state.kind === "ranked";
  return updateSeat(state, seat, (current) => ({
    ...current,
    timeBankMs: clock === null ? current.timeBankMs : bankLeftAt(clock, at),
    timeoutsInARow: isCounted ? current.timeoutsInARow + 1 : current.timeoutsInARow,
  }));
}

export function timeOut(
  state: GameState,
  seat: SeatNumber,
  random: Random,
  at: number,
): GameState {
  if (state.phase === "market") {
    const choice = { option: "B", sector: random.pickSector() } as const;
    return takeTurnDraw(state, { type: "turn_draw", seat, choice }, random, at);
  }
  const counted = withMainPhaseTimeOutCounted(state, seat, at);
  if (seatsLeavingAt(state, at).includes(seat)) {
    return leaveGame(counted, seat, random, at);
  }
  const outOfTime = updateSeat(counted, seat, (current) => ({ ...current, isOutOfTime: true }));
  return endMainPhaseIfAllDone(outOfTime, random, at);
}
