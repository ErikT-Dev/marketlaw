import type { SeatNumber } from "../shared/SeatNumber";
import { bankLeftAt } from "../shared/bankLeftAt";
import { decisionClockOf } from "./decisionClockOf";
import { endTurn } from "./endTurn";
import type { GameState } from "./GameState";
import { leaveGame } from "./leaveGame";
import type { Random } from "./Random";
import { seatsLeavingAt } from "./seatsLeavingAt";
import { takeTurnDraw } from "./takeTurnDraw";
import { updateSeat } from "./updateSeat";

function timeOutLeaving(state: GameState, seat: SeatNumber, random: Random, at: number): GameState {
  const clock = decisionClockOf(state, seat);
  const counted = updateSeat(state, seat, (current) => ({
    ...current,
    timeBankMs: clock === null ? current.timeBankMs : bankLeftAt(clock, at),
    timeoutsInARow: current.timeoutsInARow + 1,
  }));
  return leaveGame(counted, seat, random, at);
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
  if (seatsLeavingAt(state, at).includes(seat)) {
    return timeOutLeaving(state, seat, random, at);
  }
  return endTurn(state, seat, random, { at, isTimeOut: true });
}
