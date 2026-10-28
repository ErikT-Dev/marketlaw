import type { Rejection } from "../shared/Rejection";
import type { Result } from "../shared/Result";
import { claimAll } from "./claimAll";
import { completeProject } from "./completeProject";
import { endTurn } from "./endTurn";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import { playCard } from "./playCard";
import type { Random } from "./Random";
import { rejectionOf } from "./rejectionOf";
import { sellCards } from "./sellCards";
import { takeIncome } from "./takeIncome";
import { undoLatest } from "./undoLatest";
import { updateSeat } from "./updateSeat";
import { useDrawAction } from "./useDrawAction";
import { useTrade } from "./useTrade";
import { withUndoHistory } from "./withUndoHistory";

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
    case "claim_all":
      return takeIncome(updateSeat(state, action.seat, claimAll), action.seat, random);
    case "complete_project":
      return takeIncome(
        completeProject(state, action.seat, action.project, random),
        action.seat,
        random,
      );
    case "influence":
      return takeIncome(
        updateSeat(state, action.seat, (seat) => useTrade(seat, action.trade)),
        action.seat,
        random,
      );
    case "draw_action":
      return takeIncome(useDrawAction(state, action, random), action.seat, random);
    case "undo":
      return updateSeat(state, action.seat, undoLatest);
  }
}

export function apply(
  state: GameState,
  action: GameAction,
  random: Random,
): Result<GameState, Rejection> {
  const code = rejectionOf(state, action);
  return code === undefined
    ? { isOk: true, value: withUndoHistory(state, action, accepted(state, action, random)) }
    : { isOk: false, error: { code } };
}
