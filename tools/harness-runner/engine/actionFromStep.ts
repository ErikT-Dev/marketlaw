import * as v from "valibot";
import type { GameAction } from "../../../src/rules/GameAction.ts";
import { CardName } from "../../../src/shared/catalogue/CardName.ts";

const SEAT = v.picklist([1, 2, 3, 4]);

const STEP_SCHEMA = v.variant("action", [
  v.strictObject({ seat: SEAT, action: v.literal("play_card"), card: CardName }),
  v.strictObject({
    seat: SEAT,
    action: v.literal("sell"),
    cards: v.pipe(v.array(CardName), v.nonEmpty()),
  }),
  v.strictObject({ seat: SEAT, action: v.literal("end_turn") }),
]);

export function actionFromStep(step: Readonly<Record<string, unknown>>): GameAction {
  const parsed = v.parse(STEP_SCHEMA, step);
  switch (parsed.action) {
    case "play_card":
      return { type: "play_card", seat: parsed.seat, card: parsed.card };
    case "sell": {
      const [first, ...rest] = parsed.cards;
      if (first === undefined) {
        throw new Error("sell names no cards");
      }
      return { type: "sell", seat: parsed.seat, cards: [first, ...rest] };
    }
    case "end_turn":
      return { type: "end_turn", seat: parsed.seat };
    default: {
      const unknownStep: never = parsed;
      throw new Error(`unknown step ${JSON.stringify(unknownStep)}`);
    }
  }
}
