import type { SeatNumber } from "../shared/SeatNumber";
import { bankAfterEndingTurn } from "./bankAfterEndingTurn";
import { endMainPhaseIfAllDone } from "./endMainPhaseIfAllDone";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import { settleBeforeDone } from "./settleBeforeDone";
import { updateSeat } from "./updateSeat";

export function endTurn(state: GameState, seat: SeatNumber, random: Random, at: number): GameState {
  const bank = bankAfterEndingTurn(state, seat, at);
  const settled = settleBeforeDone(state, seat, random, at);
  const done = {
    ...updateSeat(settled, seat, (current) => ({
      ...current,
      isDone: true,
      timeBankMs: bank ?? current.timeBankMs,
      timeoutsInARow: current.isOutOfTime ? current.timeoutsInARow : 0,
    })),
    doneOrder: [...state.doneOrder, seat],
  };
  return endMainPhaseIfAllDone(done, random, at);
}
