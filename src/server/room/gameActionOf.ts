import type { GameAction } from "../../rules/GameAction";
import type { ActionIntent } from "../../shared/protocol/ActionIntent";
import type { SeatNumber } from "../../shared/SeatNumber";

export function gameActionOf(seat: SeatNumber, intent: ActionIntent): GameAction | undefined {
  switch (intent.type) {
    case "play_card":
      return { type: "play_card", seat, card: intent.card };
    case "sell": {
      const [first, ...rest] = intent.cards;
      return first === undefined ? undefined : { type: "sell", seat, cards: [first, ...rest] };
    }
    case "end_turn":
      return { type: "end_turn", seat };
    case "claim_all":
      return { type: "claim_all", seat };
    case "complete_project":
      return { type: "complete_project", seat, project: intent.project };
    case "influence":
      return { type: "influence", seat, trade: intent.trade };
    case "draw_action":
      return { type: "draw_action", seat, kind: intent.kind, tier: intent.tier };
    case "undo":
      return { type: "undo", seat };
    case "turn_draw":
      return { type: "turn_draw", seat, choice: intent.choice };
  }
}
