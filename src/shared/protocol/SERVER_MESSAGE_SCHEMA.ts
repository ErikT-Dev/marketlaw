import * as v from "valibot";
import { EpochMs } from "../EpochMs";
import { CardName } from "../catalogue/CardName";
import { Kind } from "../catalogue/Kind";
import { Tier } from "../catalogue/Tier";
import { TypeName } from "../catalogue/TypeName";
import { ProjectName } from "../ProjectName";
import { QuestName } from "../catalogue/QuestName";
import { ReasonCode } from "../ReasonCode";
import { PlayerId } from "../PlayerId";
import { RoomCode } from "../RoomCode";
import { TradeName } from "../TradeName";
import { RemovalReason } from "./RemovalReason";
import { CHAT_ENTRY_SCHEMA } from "./CHAT_ENTRY_SCHEMA";
import { DRAW_LOG_ENTRY_SCHEMA } from "./DRAW_LOG_ENTRY_SCHEMA";
import { MAIN_PHASE_LOG_ENTRY_SCHEMA } from "./MAIN_PHASE_LOG_ENTRY_SCHEMA";
import { MARKETPLACE_SLOT_SCHEMA } from "./MARKETPLACE_SLOT_SCHEMA";
import { GAME_RESULT_SCHEMA } from "./GAME_RESULT_SCHEMA";
import { QUEST_PLACE_VIEW_SCHEMA } from "./QUEST_PLACE_VIEW_SCHEMA";
import { SEAT_NUMBER_SCHEMA } from "./SEAT_NUMBER_SCHEMA";
import { STATS_SCHEMA } from "./STATS_SCHEMA";
import { PLAYER_ICON_COLOR_COUNT } from "../PLAYER_ICON_COLOR_COUNT";
import { TUTORIAL_PROGRESS_SCHEMA } from "./TUTORIAL_PROGRESS_SCHEMA";

const COUNT = v.number();
const SEAT = SEAT_NUMBER_SCHEMA;
const STATS = STATS_SCHEMA;
const CARDS = v.array(CardName);
const SEAT_COMMON = {
  seat: SEAT,
  stats: STATS,
  city: CARDS,
  buildPasses: COUNT,
  worthGained: COUNT,
  supportThisTurn: COUNT,
  questsCompleted: v.array(QuestName),
  isDone: v.boolean(),
  isOutOfTime: v.boolean(),
  hasLeft: v.boolean(),
  timeBankMs: COUNT,
  clock: v.nullable(v.object({ bankMs: COUNT, freeUntil: EpochMs, deadline: EpochMs })),
  hasHadMarketGo: v.boolean(),
};
const PLAYER_ICON_COLOR = v.pipe(
  v.number(),
  v.integer(),
  v.minValue(0),
  v.maxValue(PLAYER_ICON_COLOR_COUNT - 1),
);
const TYPE_COUNTS = v.record(TypeName, COUNT);
const PROJECTS = v.array(ProjectName);
const SEAT_VIEW = v.variant("kind", [
  v.object({
    ...SEAT_COMMON,
    kind: v.literal("own"),
    hand: CARDS,
    newCards: CARDS,
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
    redrawsLeft: v.number(),
    redrawRejection: v.nullable(ReasonCode),
    turnDrawRejection: v.nullable(ReasonCode),
    marketCardRejection: v.nullable(ReasonCode),
    actionsThisTurn: COUNT,
  }),
  v.object({
    ...SEAT_COMMON,
    kind: v.literal("other"),
    handCount: COUNT,
    knownInHand: CARDS,
    typeCounts: TYPE_COUNTS,
    combosClaimed: v.array(v.object({ card: CardName, combo: COUNT, times: COUNT })),
    projects: PROJECTS,
    influenceUses: v.record(TradeName, COUNT),
  }),
]);
const PLAYER_VIEW = v.object({
  seat: SEAT,
  turn: COUNT,
  phase: v.picklist(["market", "main", "ended"]),
  firstPlayer: SEAT,
  marketGo: v.nullable(SEAT),
  seats: v.array(SEAT_VIEW),
  deckCount: COUNT,
  discardCount: COUNT,
  marketplace: v.array(MARKETPLACE_SLOT_SCHEMA),
  quests: v.array(QUEST_PLACE_VIEW_SCHEMA),
  bonusTypes: v.array(TypeName),
  doneOrder: v.array(SEAT),
  playerOrder: v.array(SEAT),
  drawLog: v.array(DRAW_LOG_ENTRY_SCHEMA),
  mainPhaseLog: v.array(MAIN_PHASE_LOG_ENTRY_SCHEMA),
  questsCompletedLastTurn: v.array(v.object({ quest: QuestName, seats: v.array(SEAT) })),
  firstCompletions: PROJECTS,
  vote: v.nullable(
    v.object({
      caller: SEAT,
      deadline: EpochMs,
      answered: COUNT,
      of: COUNT,
      hasToAnswer: v.boolean(),
    }),
  ),
  nextVoteTurn: COUNT,
  result: v.nullable(GAME_RESULT_SCHEMA),
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
        isPublic: v.boolean(),
        ownerName: v.string(),
        playerNames: v.array(v.string()),
        playerIds: v.array(PlayerId),
        playerIconColors: v.array(PLAYER_ICON_COLOR),
        namesInRoom: v.array(v.string()),
        idsInRoom: v.array(PlayerId),
        myName: v.string(),
        mySeat: v.nullable(SEAT),
        asking: v.nullable(
          v.object({
            deadline: EpochMs,
            acceptedNames: v.array(v.string()),
            hasAccepted: v.boolean(),
          }),
        ),
        deletionAt: v.nullable(EpochMs),
        ratings: v.nullable(v.array(v.object({ seat: SEAT, before: COUNT, after: COUNT }))),
      }),
      game: v.nullable(
        v.object({ stateVersion: COUNT, view: PLAYER_VIEW, awaySeats: v.array(SEAT) }),
      ),
    }),
    serverNow: EpochMs,
  }),
  v.object({
    type: v.literal("rejected"),
    protocolVersion: COUNT,
    actionId: v.nullable(v.string()),
    code: ReasonCode,
    sendAgainAt: v.nullable(EpochMs),
  }),
  v.object({
    type: v.literal("notice"),
    protocolVersion: COUNT,
    notice: v.variant("kind", [
      v.variant("gameKind", [
        v.object({
          kind: v.literal("timed_out"),
          gameKind: v.literal("ranked"),
          inARow: COUNT,
          of: COUNT,
        }),
        v.object({ kind: v.literal("timed_out"), gameKind: v.literal("casual") }),
      ]),
      v.object({
        kind: v.literal("resumed"),
        seats: v.array(v.object({ seat: SEAT, freeMs: COUNT })),
      }),
      v.object({ kind: v.literal("site_game_limit") }),
      v.object({
        kind: v.literal("daily_limit"),
        reason: v.picklist(["daily_action_limit", "daily_game_start_limit"]),
      }),
    ]),
  }),
  v.object({
    type: v.literal("chat"),
    protocolVersion: COUNT,
    entries: v.array(CHAT_ENTRY_SCHEMA),
    mutedNames: v.array(v.string()),
    isFullList: v.boolean(),
  }),
  v.object({
    type: v.literal("tutorial_update"),
    protocolVersion: COUNT,
    acceptedActionId: v.nullable(v.string()),
    stateVersion: COUNT,
    view: v.object({ progress: TUTORIAL_PROGRESS_SCHEMA, game: PLAYER_VIEW }),
    playerIconColor: PLAYER_ICON_COLOR,
    serverNow: EpochMs,
  }),
  v.object({ type: v.literal("opened_elsewhere"), protocolVersion: COUNT }),
  v.object({
    type: v.literal("removed"),
    protocolVersion: COUNT,
    reason: RemovalReason,
    rejoinAt: v.nullable(EpochMs),
  }),
]);
