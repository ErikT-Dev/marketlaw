import * as v from "valibot";
import type { OtherSeatView } from "../../shared/OtherSeatView";
import type { OwnSeatView } from "../../shared/OwnSeatView";
import type { PlayerView } from "../../shared/PlayerView";
import type { RoomUpdate } from "../../shared/protocol/RoomUpdate";
import { RoomCode } from "../../shared/RoomCode";
import type { SeatNumber } from "../../shared/SeatNumber";
import { OWN_SEAT_VIEW } from "../../shared/testing/OWN_SEAT_VIEW";
import { testPlayerIdOf } from "./testPlayerIdOf";

const STATS = {
  funds: 70,
  income: 14,
  influence: 3,
  workforce: 6,
  quality: 5,
  satisfaction: 4,
  product: 2,
  distribution: 1,
};
const SEAT_COMMON = {
  stats: STATS,
  city: [],
  buildPasses: 2,
  worthGained: 140,
  supportThisTurn: 0,
  isDone: false,
  isOutOfTime: false,
  hasLeft: false,
  timeBankMs: 0,
  clock: null,
  hasHadMarketGo: false,
};
const OWN_SEAT: OwnSeatView = {
  ...OWN_SEAT_VIEW,
  ...SEAT_COMMON,
  seat: 2,
  hand: ["Loft"],
  handDetails: [
    { card: "Loft", realCost: 8, sameSectorAndTierInCity: 0, playRejection: "tier_not_allowed" },
  ],
};

function other(seat: SeatNumber, changes: Partial<OtherSeatView>): OtherSeatView {
  return {
    ...SEAT_COMMON,
    kind: "other",
    seat,
    handCount: 7,
    knownInHand: [],
    questsCompleted: [],
    influenceUses: {},
    typeCounts: {},
    combosClaimed: [],
    projects: [],
    ...changes,
  };
}

export function roomUpdateWith(
  changes: Partial<PlayerView>,
  ownChanges: Partial<OwnSeatView> = {},
): RoomUpdate {
  const view: PlayerView = {
    seat: 2,
    turn: 3,
    phase: "main",
    firstPlayer: 3,
    marketGo: null,
    seats: [
      other(1, { hasLeft: true }),
      { ...OWN_SEAT, ...ownChanges },
      other(3, { isDone: true }),
      other(4, {}),
    ],
    deckCount: 100,
    discardCount: 0,
    marketplace: [],
    quests: [],
    bonusTypes: [],
    doneOrder: [3],
    playerOrder: [3, 4, 2],
    drawLog: [],
    mainPhaseLog: [],
    questsCompletedLastTurn: [],
    firstCompletions: [],
    vote: null,
    nextVoteTurn: 1,
    result: null,
    ...changes,
  };
  return {
    room: {
      code: v.parse(RoomCode, "ABCDEF"),
      size: 4,
      isPublic: false,
      ownerName: "Ann",
      playerNames: ["Ann", "Bea", "Cy", "Di"],
      playerIds: [1, 2, 3, 4].map(testPlayerIdOf),
      playerIconColors: [0, 3, 6, 9],
      namesInRoom: ["Ann", "Bea", "Cy", "Di"],
      idsInRoom: [1, 2, 3, 4].map(testPlayerIdOf),
      myName: "Bea",
      mySeat: 2,
      asking: null,
      deletionAt: null,
      ratings: null,
    },
    game: { stateVersion: 1, view, awaySeats: [] },
  };
}
