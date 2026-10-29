import * as v from "valibot";
import { CardName } from "../catalogue/CardName";
import { Sector } from "../catalogue/Sector";

export const TURN_DRAW_CHOICE_SCHEMA = v.variant("option", [
  v.strictObject({ option: v.literal("A"), card: CardName }),
  v.strictObject({ option: v.literal("B"), sector: Sector }),
]);
