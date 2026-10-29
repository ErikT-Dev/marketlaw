import * as v from "valibot";
import { CardName } from "../catalogue/CardName";
import { Kind } from "../catalogue/Kind";
import { QuestName } from "../catalogue/QuestName";
import { Tier } from "../catalogue/Tier";
import { TypeName } from "../catalogue/TypeName";
import { ProjectName } from "../ProjectName";
import { ReasonCode } from "../ReasonCode";
import { RoomCode } from "../RoomCode";
import { TradeName } from "../TradeName";
import { DRAW_LOG_ENTRY_SCHEMA } from "./DRAW_LOG_ENTRY_SCHEMA";
import { MARKETPLACE_SLOT_SCHEMA } from "./MARKETPLACE_SLOT_SCHEMA";
import { SEAT_NUMBER_SCHEMA } from "./SEAT_NUMBER_SCHEMA";
import { STATS_SCHEMA } from "./STATS_SCHEMA";

const COUNT = v.number();
const SEAT = SEAT_NUMBER_SCHEMA;
const STATS = STATS_SCHEMA;
const CARDS = v.array(CardName);
const SEAT_COMMON = {
  seat: SEAT,
  stats: STATS,
  city: CARDS,
  buildPasses: COUNT,
  isDone: v.boolean(),
  hasLeft: v.boolean(),
  timeBankMs: COUNT,
};
const TYPE_COUNTS = v.record(TypeName, COUNT);
const PROJECTS = v.array(ProjectName);
const SEAT_VIEW = v.variant("kind", [
  v.object({
    ...SEAT_COMMON,
    kind: v.literal("own"),
    hand: CARDS,
    handDetails: v.array(
      v.object({
        card: CardName,
        realCost: COUNT,
        sameSectorAndTierInCity: COUNT,
        playRejection: v.nullable(ReasonCode),
      }),
    ),
    sellRejection: v.nullable(ReasonCode),
    endTurnRejection: v.nullable(ReasonCode),
    typeCounts: TYPE_COUNTS,
    combos: v.array(
      v.object({ card: CardName, combo: COUNT, claimedTimes: COUNT, readyTimes: COUNT }),
    ),
    claimAllRejection: v.nullable(ReasonCode),
    projects: PROJECTS,
    projectRejections: v.object({
      quality: v.nullable(ReasonCode),
      satisfaction: v.nullable(ReasonCode),
      workforce: v.nullable(ReasonCode),
    }),
    hasPlayedThisTurn: v.boolean(),
    hasSkippedBuild: v.boolean(),
    influenceUses: v.record(TradeName, COUNT),
    trades: v.array(v.object({ trade: TradeName, rejection: v.nullable(ReasonCode) })),
    buildPassPrice: COUNT,
    drawActions: v.array(
      v.object({
        kind: Kind,
        tier: Tier,
        isAnyLeft: v.boolean(),
        rejection: v.nullable(ReasonCode),
      }),
    ),
    undoRejection: v.nullable(ReasonCode),
    actionsThisTurn: COUNT,
  }),
  v.object({
    ...SEAT_COMMON,
    kind: v.literal("other"),
    handCount: COUNT,
    typeCounts: TYPE_COUNTS,
    combosClaimed: v.array(v.object({ card: CardName, combo: COUNT, times: COUNT })),
    projects: PROJECTS,
  }),
]);
const PLAYER_VIEW = v.object({
  seat: SEAT,
  turn: COUNT,
  phase: v.picklist(["main", "ended"]),
  seats: v.array(SEAT_VIEW),
  deckCount: COUNT,
  discard: CARDS,
  marketplace: v.array(MARKETPLACE_SLOT_SCHEMA),
  quests: v.array(v.object({ quest: QuestName, turnsOnTable: COUNT })),
  bonusTypes: v.array(TypeName),
  doneOrder: v.array(SEAT),
  playerOrder: v.array(SEAT),
  drawLog: v.array(DRAW_LOG_ENTRY_SCHEMA),
  firstCompletions: PROJECTS,
});

export const SERVER_MESSAGE_SCHEMA = v.variant("type", [
  v.object({
    type: v.literal("update"),
    protocolVersion: COUNT,
    acceptedActionId: v.nullable(v.string()),
    update: v.object({
      room: v.object({
        code: RoomCode,
        size: COUNT,
        playerNames: v.array(v.string()),
        mySeat: v.nullable(SEAT),
      }),
      game: v.nullable(v.object({ stateVersion: COUNT, view: PLAYER_VIEW })),
    }),
  }),
  v.object({
    type: v.literal("rejected"),
    protocolVersion: COUNT,
    actionId: v.nullable(v.string()),
    code: ReasonCode,
  }),
]);
