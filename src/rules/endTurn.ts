import type { SeatNumber } from "../shared/SeatNumber";
import { bankLeftAt } from "../shared/bankLeftAt";
import { decisionClockOf } from "./decisionClockOf";
import { endMainPhase } from "./endMainPhase";
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
  const isEveryoneDone = done.seats.every((current) => current.hasLeft || current.isDone);
  return isEveryoneDone ? endMainPhase(done, random, ending.at) : done;
}
