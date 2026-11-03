import type { SeatNumber } from "../shared/SeatNumber";
import { bankLeftAt } from "../shared/bankLeftAt";
import { decisionClockOf } from "./decisionClockOf";
import { endMainPhaseIfAllDone } from "./endMainPhaseIfAllDone";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import { updateSeat } from "./updateSeat";

export function endTurn(
  state: GameState,
  seat: SeatNumber,
  random: Random,
  ending: { readonly at: number; readonly isTimeOut: boolean },
): GameState {
  const clock = decisionClockOf(state, seat);
  const done = {
    ...updateSeat(state, seat, (current) => ({
      ...current,
      isDone: true,
      timeBankMs: clock === null ? current.timeBankMs : bankLeftAt(clock, ending.at),
      timeoutsInARow: ending.isTimeOut ? current.timeoutsInARow + 1 : 0,
    })),
    doneOrder: [...state.doneOrder, seat],
  };
  return endMainPhaseIfAllDone(done, random, ending.at);
}
