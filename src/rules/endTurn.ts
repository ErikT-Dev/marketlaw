import type { SeatNumber } from "../shared/SeatNumber";
import { endMainPhase } from "./endMainPhase";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import { updateSeat } from "./updateSeat";

export function endTurn(state: GameState, seat: SeatNumber, random: Random): GameState {
  const done = {
    ...updateSeat(state, seat, (current) => ({ ...current, isDone: true })),
    doneOrder: [...state.doneOrder, seat],
  };
  const isEveryoneDone = done.seats.every((current) => current.hasLeft || current.isDone);
  return isEveryoneDone ? endMainPhase(done, random) : done;
}
