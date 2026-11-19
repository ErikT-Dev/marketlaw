import * as v from "valibot";
import { CardName } from "../catalogue/CardName";
import { Kind } from "../catalogue/Kind";
import { QuestName } from "../catalogue/QuestName";
import { Tier } from "../catalogue/Tier";
import { ProjectName } from "../ProjectName";
import { TradeName } from "../TradeName";
import { TURN_DRAW_CHOICE_SCHEMA } from "./TURN_DRAW_CHOICE_SCHEMA";

export const ActionIntent = v.variant("type", [
  v.strictObject({ type: v.literal("play_card"), card: CardName }),
  v.strictObject({
    type: v.literal("sell"),
    cards: v.pipe(v.array(CardName), v.minLength(1), v.maxLength(240)),
  }),
  v.strictObject({ type: v.literal("end_turn") }),
  v.strictObject({ type: v.literal("claim_all") }),
  v.strictObject({ type: v.literal("complete_project"), project: ProjectName }),
  v.strictObject({ type: v.literal("complete_quest"), quest: QuestName }),
  v.strictObject({ type: v.literal("influence"), trade: TradeName }),
  v.strictObject({ type: v.literal("draw_action"), kind: Kind, tier: Tier }),
  v.strictObject({ type: v.literal("undo") }),
  v.strictObject({ type: v.literal("redraw_hand") }),
  v.strictObject({ type: v.literal("leave_game") }),
  v.strictObject({ type: v.literal("call_vote") }),
  v.strictObject({ type: v.literal("vote"), vote: v.picklist(["yes", "no"]) }),
  v.strictObject({ type: v.literal("turn_draw"), choice: TURN_DRAW_CHOICE_SCHEMA }),
]);

export type ActionIntent = v.InferOutput<typeof ActionIntent>;
