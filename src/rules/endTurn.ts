import type { SeatNumber } from "../shared/SeatNumber";
import { bankLeftAt } from "../shared/bankLeftAt";
import { decisionClockOf } from "./decisionClockOf";
import { endMainPhaseIfAllDone } from "./endMainPhaseIfAllDone";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import { updateSeat } from "./updateSeat";

export function endTurn(state: GameState, seat: SeatNumber, random: Random, at: number): GameState {
  const clock = decisionClockOf(state, seat);
  const done = {
    ...updateSeat(state, seat, (current) => ({
      ...current,
      isDone: true,
      timeBankMs: clock === null ? current.timeBankMs : bankLeftAt(clock, at),
      timeoutsInARow: current.isOutOfTime ? current.timeoutsInARow : 0,
    })),
    doneOrder: [...state.doneOrder, seat],
  };
  return endMainPhaseIfAllDone(done, random, at);
}
