import type { SeatNumber } from "../shared/SeatNumber";
import { bankLeftAt } from "../shared/bankLeftAt";
import { decisionClockOf } from "./decisionClockOf";
import { endMainPhaseIfAllDone } from "./endMainPhaseIfAllDone";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import { settleBeforeDone } from "./settleBeforeDone";
import { updateSeat } from "./updateSeat";

export function endTurn(state: GameState, seat: SeatNumber, random: Random, at: number): GameState {
  const clock = decisionClockOf(state, seat);
  const settled = settleBeforeDone(state, seat, random, at);
  const done = {
    ...updateSeat(settled, seat, (current) => ({
      ...current,
      isDone: true,
      timeBankMs: clock === null ? current.timeBankMs : bankLeftAt(clock, at),
      timeoutsInARow: current.isOutOfTime ? current.timeoutsInARow : 0,
    })),
    doneOrder: [...state.doneOrder, seat],
  };
  return endMainPhaseIfAllDone(done, random, at);
}
