import type { SeatNumber } from "../shared/SeatNumber";
import { endGame } from "./endGame";
import { endMainPhaseIfAllDone } from "./endMainPhaseIfAllDone";
import { endMarketPhase } from "./endMarketPhase";
import type { GameState } from "./GameState";
import { marketGoOf } from "./marketGoOf";
import type { Random } from "./Random";
import { seatOf } from "./seatOf";
import { seatsLeavingAt } from "./seatsLeavingAt";
import { updateSeat } from "./updateSeat";

function goOnWithoutLeaver(state: GameState, random: Random, at: number): GameState {
  switch (state.phase) {
    case "main":
      return endMainPhaseIfAllDone(state, random, at);
    case "market":
      return marketGoOf(state) === null ? endMarketPhase(state, at) : state;
    case "ended":
      return state;
  }
}

function afterLeaving(state: GameState, random: Random, at: number): GameState {
  const stillIn = state.seats.filter((seat) => !seat.hasLeft);
  if (stillIn.length === 0) {
    return endGame(state, at, "abandoned");
  }
  if (stillIn.length === 1 && seatsLeavingAt(state, at).length === 0) {
    return endGame(state, at, "last_player");
  }
  return goOnWithoutLeaver(state, random, at);
}

export function leaveGame(
  state: GameState,
  seat: SeatNumber,
  random: Random,
  at: number,
): GameState {
  const hand = seatOf(state, seat)?.hand ?? [];
  const isMainPhase = state.phase === "main";
  const left = {
    ...updateSeat(state, seat, (current) => ({
      ...current,
      hasLeft: true,
      isDone: true,
      hand: [],
      knownInHand: [],
      newCards: [],
      undoPoints: [],
    })),
    holdingPile: isMainPhase ? [...state.holdingPile, ...hand] : state.holdingPile,
    discard: isMainPhase ? state.discard : [...state.discard, ...hand],
    leaveOrder: [...state.leaveOrder, seat],
    clockStartedAt: marketGoOf(state) === seat ? at : state.clockStartedAt,
  };
  return afterLeaving(left, random, at);
}
