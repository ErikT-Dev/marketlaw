import { cardOf } from "../shared/catalogue/cardOf";
import type { ReasonCode } from "../shared/ReasonCode";
import { ACTION_LIMIT } from "./ACTION_LIMIT";
import { FIRST_TURN_FOR_HIGHER_TIERS } from "./FIRST_TURN_FOR_HIGHER_TIERS";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import { realCostOf } from "./realCostOf";
import { removeCards } from "./removeCards";
import { seatOf } from "./seatOf";
import type { SeatState } from "./SeatState";

type PlayCard = Extract<GameAction, { readonly type: "play_card" }>;

function turnRejection(state: GameState, action: GameAction): ReasonCode | undefined {
  const seat = seatOf(state, action.seat);
  if (seat === undefined || seat.hasLeft) {
    return "not_in_game";
  }
  if (state.phase === "ended") {
    return "game_over";
  }
  if (seat.isDone) {
    return "already_done";
  }
  return action.type !== "end_turn" && seat.actionsThisTurn >= ACTION_LIMIT
    ? "action_limit_reached"
    : undefined;
}

function playRejection(state: GameState, seat: SeatState, action: PlayCard): ReasonCode | undefined {
  if (!seat.hand.includes(action.card)) {
    return "card_not_in_hand";
  }
  const card = cardOf(action.card);
  if (card.tier > 1 && state.turn < FIRST_TURN_FOR_HIGHER_TIERS) {
    return "tier_not_allowed";
  }
  if (seat.hasPlayedThisTurn && seat.buildPasses === 0) {
    return "no_build_pass";
  }
  if (seat.hasSkippedBuild) {
    return "build_skipped";
  }
  return seat.stats.funds < realCostOf(card, seat) ? "not_enough_funds" : undefined;
}

export function rejectionOf(state: GameState, action: GameAction): ReasonCode | undefined {
  const turnCode = turnRejection(state, action);
  const seat = seatOf(state, action.seat);
  if (turnCode !== undefined || seat === undefined) {
    return turnCode;
  }
  switch (action.type) {
    case "play_card":
      return playRejection(state, seat, action);
    case "sell":
      return removeCards(seat.hand, action.cards) === undefined ? "card_not_in_hand" : undefined;
    case "end_turn":
      return undefined;
  }
}
