import * as v from "valibot";
import { CardName } from "../../shared/catalogue/CardName";
import { EpochMs } from "../../shared/EpochMs";
import { QuestName } from "../../shared/catalogue/QuestName";
import { TypeName } from "../../shared/catalogue/TypeName";
import { ProjectName } from "../../shared/ProjectName";
import { TradeName } from "../../shared/TradeName";
import { GAME_RESULT_SCHEMA } from "../../shared/protocol/GAME_RESULT_SCHEMA";
import { DRAW_LOG_ENTRY_SCHEMA } from "../../shared/protocol/DRAW_LOG_ENTRY_SCHEMA";
import { MAIN_PHASE_LOG_ENTRY_SCHEMA } from "../../shared/protocol/MAIN_PHASE_LOG_ENTRY_SCHEMA";
import { MARKETPLACE_SLOT_SCHEMA } from "../../shared/protocol/MARKETPLACE_SLOT_SCHEMA";
import { SEAT_NUMBER_SCHEMA } from "../../shared/protocol/SEAT_NUMBER_SCHEMA";
import { STATS_SCHEMA } from "../../shared/protocol/STATS_SCHEMA";
import { STARTING_WORTH_GAINED } from "../../rules/STARTING_WORTH_GAINED";

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
  mainPhaseStartedAt: v.optional(v.nullable(v.number()), null),
  gainedTypes: v.record(TypeName, v.number()),
  combosClaimed: v.array(v.object({ card: CardName, combo: v.number(), times: v.number() })),
  projects: v.array(ProjectName),
  questsCompleted: v.array(QuestName),
  buildPasses: v.number(),
  buildPassesBought: v.number(),
  hasPlayedThisTurn: v.boolean(),
  influenceUses: v.record(TradeName, v.number()),
  actionsThisTurn: v.number(),
  isDone: v.boolean(),
  isOutOfTime: v.optional(v.boolean(), false),
  isTurnDrawOpen: v.optional(v.boolean(), false),
  logEntriesThisMainPhase: v.optional(v.array(MAIN_PHASE_LOG_ENTRY_SCHEMA), []),
  departure: v.nullable(v.object({ turn: v.number(), cardsInHand: v.number() })),
  timeBankMs: v.number(),
  timeoutsInARow: v.number(),
  undoPoints: v.tuple([]),
  isUndoBlocked: v.boolean(),
  redrawsUsed: v.optional(v.number(), 0),
  worthGained: v.optional(v.number(), STARTING_WORTH_GAINED),
});

export const GAME_STATE_SCHEMA = v.object({
  kind: v.optional(v.picklist(["casual", "ranked"]), "casual"),
  turn: v.number(),
  phase: v.picklist(["market", "main", "ended"]),
  firstPlayer: SEAT_NUMBER_SCHEMA,
  seats: v.pipe(v.array(SEAT_STATE), v.minLength(1), v.maxLength(4)),
  deck: CARDS,
  discard: CARDS,
  holdingPile: CARDS,
  marketplace: v.array(MARKETPLACE_SLOT_SCHEMA),
  quests: v.array(
    v.nullable(
      v.object({ quest: QuestName, turnsOnTable: v.number(), isInExtraTurn: v.boolean() }),
    ),
  ),
  questList: v.array(QuestName),
  bonusTypes: v.array(TypeName),
  doneOrder: v.array(SEAT_NUMBER_SCHEMA),
  leaveOrder: v.array(SEAT_NUMBER_SCHEMA),
  drawLog: v.array(DRAW_LOG_ENTRY_SCHEMA),
  mainPhaseLog: v.optional(v.array(MAIN_PHASE_LOG_ENTRY_SCHEMA), []),
  clockStartedAt: EpochMs,
  pause: v.optional(
    v.nullable(v.object({ at: v.number(), seats: v.array(SEAT_NUMBER_SCHEMA) })),
    null,
  ),
  vote: v.optional(v.null(), null),
  lastVoteTurn: v.optional(v.nullable(v.number()), null),
  grace: v.optional(v.tuple([]), []),
  result: v.nullable(GAME_RESULT_SCHEMA),
});
