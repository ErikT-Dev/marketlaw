import { endGame } from "./endGame";
import { endMainPhase } from "./endMainPhase";
import type { GameState } from "./GameState";
import { isFinalTurn } from "./isFinalTurn";
import { playerOrderOf } from "./playerOrderOf";
import type { Random } from "./Random";
import { settleBeforeDone } from "./settleBeforeDone";
import { withMainPhaseLogWritten } from "./withMainPhaseLogWritten";

function withOutOfTimeSeatsDone(state: GameState, random: Random, at: number): GameState {
  const isAnyonePlayingInTime = state.seats.some(
    (seat) => seat.departure === null && !seat.isDone && !seat.isOutOfTime,
  );
  if (isAnyonePlayingInTime) {
    return state;
  }
  const madeDone = playerOrderOf(state).filter((number) =>
    state.seats.some((seat) => seat.seat === number && !seat.isDone),
  );
  const settled = madeDone.reduce(
    (soFar, seat) => settleBeforeDone(soFar, seat, random, at),
    state,
  );
  return {
    ...settled,
    seats: settled.seats.map((seat) =>
      madeDone.includes(seat.seat) ? { ...seat, isDone: true } : seat,
    ),
    doneOrder: [...state.doneOrder, ...madeDone],
  };
}

export function endMainPhaseIfAllDone(state: GameState, random: Random, at: number): GameState {
  const settled = withOutOfTimeSeatsDone(state, random, at);
  const isEveryoneDone = settled.seats.every((seat) => seat.departure !== null || seat.isDone);
  if (!isEveryoneDone) {
    return settled;
  }
  const logged = withMainPhaseLogWritten(settled);
  return isFinalTurn(logged) ? endGame(logged, at) : endMainPhase(logged, random, at);
}
