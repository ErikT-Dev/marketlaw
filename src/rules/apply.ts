import type { Rejection } from "../shared/Rejection";
import type { Result } from "../shared/Result";
import { endTurn } from "./endTurn";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import { playCard } from "./playCard";
import type { Random } from "./Random";
import { rejectionOf } from "./rejectionOf";
import { sellCards } from "./sellCards";
import { takeIncome } from "./takeIncome";
import { updateSeat } from "./updateSeat";

function accepted(state: GameState, action: GameAction, random: Random): GameState {
  switch (action.type) {
    case "play_card":
      return takeIncome(
        updateSeat(state, action.seat, (seat) => playCard(seat, action.card)),
        action.seat,
        random,
      );
    case "sell":
      return takeIncome(sellCards(state, action.seat, action.cards), action.seat, random);
    case "end_turn":
      return endTurn(state, action.seat, random);
  }
}

export function apply(
  state: GameState,
  action: GameAction,
  random: Random,
): Result<GameState, Rejection> {
  const code = rejectionOf(state, action);
  return code === undefined
    ? { isOk: true, value: accepted(state, action, random) }
    : { isOk: false, error: { code } };
}
