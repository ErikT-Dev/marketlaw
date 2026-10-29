import * as v from "valibot";
import { CardName } from "../catalogue/CardName";
import { Kind } from "../catalogue/Kind";
import { Tier } from "../catalogue/Tier";
import { ProjectName } from "../ProjectName";
import { TradeName } from "../TradeName";

export const ActionIntent = v.variant("type", [
  v.strictObject({ type: v.literal("play_card"), card: CardName }),
  v.strictObject({
    type: v.literal("sell"),
    cards: v.pipe(v.array(CardName), v.minLength(1), v.maxLength(240)),
  }),
  v.strictObject({ type: v.literal("end_turn") }),
  v.strictObject({ type: v.literal("claim_all") }),
  v.strictObject({ type: v.literal("complete_project"), project: ProjectName }),
  v.strictObject({ type: v.literal("influence"), trade: TradeName }),
  v.strictObject({ type: v.literal("draw_action"), kind: Kind, tier: Tier }),
  v.strictObject({ type: v.literal("undo") }),
]);

export type ActionIntent = v.InferOutput<typeof ActionIntent>;
