import * as v from "valibot";
import { CardName } from "../catalogue/CardName";

export const MARKETPLACE_SLOT_SCHEMA = v.object({
  place: v.picklist([
    "residential",
    "industry",
    "service",
    "public_quality",
    "public_satisfaction",
    "open_1",
    "open_2",
    "open_3",
  ]),
  card: v.nullable(CardName),
  phasesShown: v.number(),
});
