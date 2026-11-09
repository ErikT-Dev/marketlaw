import type { CardName } from "../shared/catalogue/CardName";
import { cardOf } from "../shared/catalogue/cardOf";
import type { ReasonCode } from "../shared/ReasonCode";
import { drawActionRejection } from "./drawActionRejection";
import { FIRST_TURN_FOR_HIGHER_TIERS } from "./FIRST_TURN_FOR_HIGHER_TIERS";
import { kindTiersLeftAsSeenBy } from "./kindTiersLeftAsSeenBy";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import type { PlayerAction } from "./PlayerAction";
import { realCostOf } from "./realCostOf";
import { projectRejection } from "./projectRejection";
import { questRejection } from "./questRejection";
import { readyCombosOf } from "./readyCombosOf";
import { removeCards } from "./removeCards";
import { tradeRejection } from "./tradeRejection";
import { seatOf } from "./seatOf";
import type { SeatState } from "./SeatState";
import { turnRejectionOf } from "./turnRejectionOf";
import { isVoteAction } from "./isVoteAction";
import type { VoteAction } from "./VoteAction";
import { voteRejectionOf } from "./voteRejectionOf";

type PlayCard = Extract<GameAction, { readonly type: "play_card" }>;
type TurnDraw = Extract<GameAction, { readonly type: "turn_draw" }>;
type ProgressAction = Extract<
  GameAction,
  { readonly type: "claim_all" | "complete_project" | "complete_quest" }
>;

function progressRejection(
  state: GameState,
  seat: SeatState,
  action: ProgressAction,
): ReasonCode | undefined {
  switch (action.type) {
    case "claim_all":
      return readyCombosOf(seat).length === 0 ? "nothing_to_claim" : undefined;
    case "complete_project":
      return projectRejection(seat, action.project);
    case "complete_quest":
      return questRejection(state, seat, action.quest);
  }
}

function turnDrawRejection(state: GameState, action: TurnDraw): ReasonCode | undefined {
  const { choice } = action;
  if (choice.option === "B") {
    return undefined;
  }
  if (state.marketplace.every(({ card }) => card === null)) {
    return "marketplace_empty";
  }
  return state.marketplace.some(({ card }) => card === choice.card)
    ? undefined
    : "card_not_in_marketplace";
}

function undoRejection(seat: SeatState): ReasonCode | undefined {
  if (seat.undoPoints.length > 0) {
    return undefined;
  }
  return seat.isUndoBlocked ? "cannot_undo" : "nothing_to_undo";
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

function sellRejection(
  seat: SeatState,
  cards: ReadonlyArray<CardName>,
): ReasonCode | undefined {
  return removeCards(seat.hand, cards) === undefined ? "card_not_in_hand" : undefined;
}

function seatActionRejection(
  state: GameState,
  seat: SeatState,
  action: Exclude<PlayerAction, VoteAction>,
): ReasonCode | undefined {
  switch (action.type) {
    case "play_card":
      return playRejection(state, seat, action);
    case "sell":
      return sellRejection(seat, action.cards);
    case "end_turn":
    case "leave_game":
      return undefined;
    case "claim_all":
    case "complete_project":
    case "complete_quest":
      return progressRejection(state, seat, action);
    case "influence":
      return tradeRejection(seat, action.trade);
    case "draw_action":
      return drawActionRejection(
        seat,
        kindTiersLeftAsSeenBy(state, seat.seat),
        action.kind,
        action.tier,
      );
    case "undo":
      return undoRejection(seat);
    case "turn_draw":
      return turnDrawRejection(state, action);
  }
}

export function rejectionOf(state: GameState, action: PlayerAction): ReasonCode | undefined {
  const turnCode = turnRejectionOf(state, action.seat, action.type);
  const seat = seatOf(state, action.seat);
  if (turnCode !== undefined || seat === undefined) {
    return turnCode;
  }
  return isVoteAction(action)
    ? voteRejectionOf(state, action)
    : seatActionRejection(state, seat, action);
}
