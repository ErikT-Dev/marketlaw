import * as v from "valibot";
import { CardName } from "../../shared/catalogue/CardName";
import { EpochMs } from "../../shared/EpochMs";
import { QuestName } from "../../shared/catalogue/QuestName";
import { TypeName } from "../../shared/catalogue/TypeName";
import { ProjectName } from "../../shared/ProjectName";
import { TradeName } from "../../shared/TradeName";
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
  drawnThisPhase: CARDS,
  newCards: CARDS,
  knownInHand: CARDS,
  hasHadMarketGo: v.boolean(),
  gainedTypes: v.record(TypeName, v.number()),
  combosClaimed: v.array(v.object({ card: CardName, combo: v.number(), times: v.number() })),
  projects: v.array(ProjectName),
  projectsThisTurn: v.array(ProjectName),
  questsCompleted: v.array(QuestName),
  buildPasses: v.number(),
  buildPassesBought: v.number(),
  hasPlayedThisTurn: v.boolean(),
  hasSkippedBuild: v.boolean(),
  influenceUses: v.record(TradeName, v.number()),
  actionsThisTurn: v.number(),
  isDone: v.boolean(),
  hasLeft: v.boolean(),
  timeBankMs: v.number(),
  timeoutsInARow: v.number(),
  undoPoints: v.tuple([]),
  isUndoBlocked: v.boolean(),
});

export const GAME_STATE_SCHEMA = v.object({
  turn: v.number(),
  phase: v.picklist(["market", "main", "ended"]),
  firstPlayer: SEAT_NUMBER_SCHEMA,
  seats: v.pipe(v.array(SEAT_STATE), v.minLength(1), v.maxLength(4)),
  deck: CARDS,
  discard: CARDS,
  holdingPile: CARDS,
  marketplace: v.array(MARKETPLACE_SLOT_SCHEMA),
  quests: v.array(v.nullable(v.object({ quest: QuestName, turnsOnTable: v.number() }))),
  questList: v.array(QuestName),
  bonusTypes: v.array(TypeName),
  doneOrder: v.array(SEAT_NUMBER_SCHEMA),
  drawLog: v.array(DRAW_LOG_ENTRY_SCHEMA),
  firstCompletions: v.array(ProjectName),
  clockStartedAt: EpochMs,
});
