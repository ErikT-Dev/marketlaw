import * as v from "valibot";
import { CardName } from "../catalogue/CardName";
import { QuestName } from "../catalogue/QuestName";
import { TypeName } from "../catalogue/TypeName";
import { ReasonCode } from "../ReasonCode";
import { RoomCode } from "../RoomCode";

const COUNT = v.number();
const SEAT = v.picklist([1, 2, 3, 4]);
const CARDS = v.array(CardName);
const STATS = v.object({
  funds: COUNT,
  income: COUNT,
  influence: COUNT,
  workforce: COUNT,
  quality: COUNT,
  satisfaction: COUNT,
  product: COUNT,
  distribution: COUNT,
  bonus: COUNT,
});
const SEAT_COMMON = {
  seat: SEAT,
  stats: STATS,
  city: CARDS,
  buildPasses: COUNT,
  isDone: v.boolean(),
  hasLeft: v.boolean(),
  timeBankMs: COUNT,
};
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
    hasPlayedThisTurn: v.boolean(),
    hasSkippedBuild: v.boolean(),
    actionsThisTurn: COUNT,
  }),
  v.object({ ...SEAT_COMMON, kind: v.literal("other"), handCount: COUNT }),
]);
const PLAYER_VIEW = v.object({
  seat: SEAT,
  turn: COUNT,
  phase: v.picklist(["main", "ended"]),
  seats: v.array(SEAT_VIEW),
  deckCount: COUNT,
  discard: CARDS,
  marketplace: v.array(
    v.object({
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
      phasesShown: COUNT,
    }),
  ),
  quests: v.array(v.object({ quest: QuestName, turnsOnTable: COUNT })),
  bonusTypes: v.array(TypeName),
  doneOrder: v.array(SEAT),
  playerOrder: v.array(SEAT),
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
