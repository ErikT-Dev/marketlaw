import type { ReasonCode } from "../../../shared/ReasonCode";

const SOMETHING_WENT_WRONG = "Something went wrong. The page reloads your game.";

export const REJECTION_MESSAGES: Readonly<Record<ReasonCode, string>> = {
  out_of_time: "Your time ran out before your move arrived.",
  wrong_phase: "You cannot do that in this phase.",
  not_your_go: "Wait for your go in the market phase.",
  already_done: "You are done for this turn.",
  action_limit_reached: "You have used all 50 actions this turn. You can still end your turn.",
  game_over: "The game has ended.",
  not_in_game: "You are not playing in this game.",
  card_not_in_hand: "That card is not in your hand any more.",
  not_enough_funds: "You do not have enough funds.",
  tier_not_allowed: "Tier 2 and 3 cards can be played from turn 5.",
  no_build_pass: "You already played a card this turn. A build pass lets you play another.",
  build_skipped: "You skipped build this turn, so you cannot play a card.",
  out_of_market: "You already had your market go this turn.",
  not_this_step: "Not this step.",
  wrong_protocol_version: "A new version is available: reload.",
  stale_state: "",
  malformed_message: SOMETHING_WENT_WRONG,
  unknown_action: SOMETHING_WENT_WRONG,
  invalid_token: SOMETHING_WENT_WRONG,
  room_not_found: SOMETHING_WENT_WRONG,
  room_full: SOMETHING_WENT_WRONG,
  room_not_waiting: SOMETHING_WENT_WRONG,
  invalid_room_size: SOMETHING_WENT_WRONG,
};
