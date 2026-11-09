import type { GameAction } from "../../rules/GameAction";
import type { ActionIntent } from "../../shared/protocol/ActionIntent";
import type { SeatNumber } from "../../shared/SeatNumber";

const INTENTS_WITHOUT_DETAILS = [
  "end_turn",
  "claim_all",
  "undo",
  "leave_game",
  "call_vote",
] as const;

type IntentWithoutDetails = Extract<
  ActionIntent,
  { readonly type: (typeof INTENTS_WITHOUT_DETAILS)[number] }
>;

function hasNoDetails(intent: ActionIntent): intent is IntentWithoutDetails {
  return INTENTS_WITHOUT_DETAILS.some((type) => type === intent.type);
}

export function gameActionOf(seat: SeatNumber, intent: ActionIntent): GameAction | undefined {
  if (hasNoDetails(intent)) {
    return { type: intent.type, seat };
  }
  switch (intent.type) {
    case "play_card":
      return { type: "play_card", seat, card: intent.card };
    case "sell": {
      const [first, ...rest] = intent.cards;
      return first === undefined ? undefined : { type: "sell", seat, cards: [first, ...rest] };
    }
    case "complete_project":
      return { type: "complete_project", seat, project: intent.project };
    case "complete_quest":
      return { type: "complete_quest", seat, quest: intent.quest };
    case "influence":
      return { type: "influence", seat, trade: intent.trade };
    case "draw_action":
      return { type: "draw_action", seat, kind: intent.kind, tier: intent.tier };
    case "vote":
      return { type: "vote", seat, answer: intent.vote };
    case "turn_draw":
      return { type: "turn_draw", seat, choice: intent.choice };
  }
}
