import * as v from "valibot";
import { CardName } from "../../shared/catalogue/CardName";
import { QuestName } from "../../shared/catalogue/QuestName";
import { TypeName } from "../../shared/catalogue/TypeName";
import { DRAW_LOG_ENTRY_SCHEMA } from "../../shared/protocol/DRAW_LOG_ENTRY_SCHEMA";
import { MARKETPLACE_SLOT_SCHEMA } from "../../shared/protocol/MARKETPLACE_SLOT_SCHEMA";
import { SEAT_NUMBER_SCHEMA } from "../../shared/protocol/SEAT_NUMBER_SCHEMA";
import { STATS_SCHEMA } from "../../shared/protocol/STATS_SCHEMA";

const CARDS = v.array(CardName);
const SEAT_STATE = v.object({
  seat: SEAT_NUMBER_SCHEMA,
  stats: STATS_SCHEMA,
  hand: CARDS,
  city: CARDS,
  gainedTypes: v.record(TypeName, v.number()),
  buildPasses: v.number(),
  buildPassesBought: v.number(),
  hasPlayedThisTurn: v.boolean(),
  hasSkippedBuild: v.boolean(),
  actionsThisTurn: v.number(),
  isDone: v.boolean(),
  hasLeft: v.boolean(),
  timeBankMs: v.number(),
});

export const GAME_STATE_SCHEMA = v.object({
  turn: v.number(),
  phase: v.picklist(["main", "ended"]),
  seats: v.pipe(v.array(SEAT_STATE), v.minLength(1), v.maxLength(4)),
  deck: CARDS,
  discard: CARDS,
  holdingPile: CARDS,
  marketplace: v.array(MARKETPLACE_SLOT_SCHEMA),
  quests: v.array(v.object({ quest: QuestName, turnsOnTable: v.number() })),
  questList: v.array(QuestName),
  bonusTypes: v.array(TypeName),
  doneOrder: v.array(SEAT_NUMBER_SCHEMA),
  drawLog: v.array(DRAW_LOG_ENTRY_SCHEMA),
});
