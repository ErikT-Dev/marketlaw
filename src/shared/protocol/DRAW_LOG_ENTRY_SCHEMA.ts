import * as v from "valibot";
import { Kind } from "../catalogue/Kind";
import { Sector } from "../catalogue/Sector";
import { SEAT_NUMBER_SCHEMA } from "./SEAT_NUMBER_SCHEMA";
import { TURN_DRAW_CHOICE_SCHEMA } from "./TURN_DRAW_CHOICE_SCHEMA";

const TIER = v.picklist([1, 2, 3]);
const DRAW_ASKED = v.variant("by", [
  v.object({ by: v.literal("sector"), sector: Sector, tier: TIER }),
  v.object({ by: v.literal("kind"), kind: Kind, tier: TIER }),
]);

export const DRAW_LOG_ENTRY_SCHEMA = v.variant("kind", [
  v.object({
    kind: v.literal("draw"),
    turn: v.number(),
    seat: SEAT_NUMBER_SCHEMA,
    cause: v.picklist(["income", "project", "quest", "draw_action"]),
    count: v.number(),
    asked: DRAW_ASKED,
  }),
  v.object({
    kind: v.literal("turn_draw"),
    turn: v.number(),
    seat: SEAT_NUMBER_SCHEMA,
    choice: TURN_DRAW_CHOICE_SCHEMA,
    count: v.number(),
    asked: DRAW_ASKED,
  }),
  v.object({
    kind: v.literal("shuffle"),
    turn: v.number(),
    seat: v.nullable(SEAT_NUMBER_SCHEMA),
    asked: v.nullable(DRAW_ASKED),
    count: v.number(),
  }),
]);
