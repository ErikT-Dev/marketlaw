import { cardOf } from "../shared/catalogue/cardOf";
import type { ReasonCode } from "../shared/ReasonCode";
import { FIRST_TURN_FOR_HIGHER_TIERS } from "./FIRST_TURN_FOR_HIGHER_TIERS";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import { realCostOf } from "./realCostOf";
import { projectRejection } from "./projectRejection";
import { readyCombosOf } from "./readyCombosOf";
import { removeCards } from "./removeCards";
import { tradeRejection } from "./tradeRejection";
import { seatOf } from "./seatOf";
import type { SeatState } from "./SeatState";
import { turnRejectionOf } from "./turnRejectionOf";

type PlayCard = Extract<GameAction, { readonly type: "play_card" }>;

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
  const turnCode = turnRejectionOf(state, action.seat, action.type);
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
    case "claim_all":
      return readyCombosOf(seat).length === 0 ? "nothing_to_claim" : undefined;
    case "complete_project":
      return projectRejection(seat, action.project);
    case "influence":
      return tradeRejection(seat, action.trade);
  }
}
