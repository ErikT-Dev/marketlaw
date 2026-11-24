import * as v from "valibot";
import { CardName } from "../catalogue/CardName";
import { QuestName } from "../catalogue/QuestName";
import { ProjectName } from "../ProjectName";
import { TradeName } from "../TradeName";
import { SEAT_NUMBER_SCHEMA } from "./SEAT_NUMBER_SCHEMA";

export const MAIN_PHASE_LOG_ENTRY_SCHEMA = v.variant("kind", [
  v.object({
    kind: v.literal("played"),
    turn: v.number(),
    seat: SEAT_NUMBER_SCHEMA,
    card: CardName,
  }),
  v.object({
    kind: v.literal("completed_quest"),
    turn: v.number(),
    seat: SEAT_NUMBER_SCHEMA,
    quest: QuestName,
  }),
  v.object({
    kind: v.literal("completed_project"),
    turn: v.number(),
    seat: SEAT_NUMBER_SCHEMA,
    project: ProjectName,
  }),
  v.object({
    kind: v.literal("influence"),
    turn: v.number(),
    seat: SEAT_NUMBER_SCHEMA,
    trade: TradeName,
  }),
  v.object({
    kind: v.literal("redrew"),
    turn: v.number(),
    seat: SEAT_NUMBER_SCHEMA,
    times: v.number(),
  }),
  v.object({
    kind: v.literal("income_gained"),
    turn: v.number(),
    seat: SEAT_NUMBER_SCHEMA,
    income: v.number(),
  }),
  v.object({
    kind: v.literal("support"),
    turn: v.number(),
    seat: SEAT_NUMBER_SCHEMA,
    funds: v.number(),
  }),
]);
