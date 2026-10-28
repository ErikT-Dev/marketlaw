import * as v from "valibot";
import { Kind } from "../../shared/catalogue/Kind";
import { Tier } from "../../shared/catalogue/Tier";
import type { OtherSeatView } from "../../shared/OtherSeatView";
import type { OwnSeatView } from "../../shared/OwnSeatView";
import type { PlayerView } from "../../shared/PlayerView";
import type { RoomUpdate } from "../../shared/protocol/RoomUpdate";
import { RoomCode } from "../../shared/RoomCode";
import type { SeatNumber } from "../../shared/SeatNumber";
import { TradeName } from "../../shared/TradeName";

const STATS = {
  funds: 7,
  income: 14,
  influence: 3,
  workforce: 6,
  quality: 5,
  satisfaction: 4,
  product: 2,
  distribution: 1,
  bonus: 8,
};
const SEAT_COMMON = {
  stats: STATS,
  city: [],
  buildPasses: 2,
  isDone: false,
  hasLeft: false,
  timeBankMs: 0,
};
const OWN_SEAT: OwnSeatView = {
  ...SEAT_COMMON,
  kind: "own",
  seat: 2,
  hand: ["Loft"],
  handDetails: [
    { card: "Loft", realCost: 8, sameSectorAndTierInCity: 0, playRejection: "tier_not_allowed" },
  ],
  sellRejection: null,
  endTurnRejection: null,
  typeCounts: {},
  combos: [],
  claimAllRejection: "nothing_to_claim",
  projects: [],
  projectRejections: {
    quality: "project_needs_not_met",
    satisfaction: "project_needs_not_met",
    workforce: "project_needs_not_met",
  },
  hasPlayedThisTurn: false,
  hasSkippedBuild: false,
  influenceUses: {},
  trades: TradeName.options.map((trade) => ({ trade, rejection: null })),
  buildPassPrice: 2,
  drawActions: Kind.options.flatMap((kind) =>
    Tier.options.map((tier) => ({ kind, tier, rejection: null })),
  ),
  undoRejection: "nothing_to_undo",
  actionsThisTurn: 0,
};

function other(seat: SeatNumber, changes: Partial<OtherSeatView>): OtherSeatView {
  return {
    ...SEAT_COMMON,
    kind: "other",
    seat,
    handCount: 7,
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
    seats: [
      other(1, { hasLeft: true }),
      { ...OWN_SEAT, ...ownChanges },
      other(3, { isDone: true }),
      other(4, {}),
    ],
    deckCount: 100,
    discard: [],
    marketplace: [],
    quests: [],
    bonusTypes: [],
    doneOrder: [3],
    playerOrder: [3, 4, 2],
    drawLog: [],
    firstCompletions: [],
    ...changes,
  };
  return {
    room: {
      code: v.parse(RoomCode, "ABCDEF"),
      size: 4,
      playerNames: ["Ann", "Bea", "Cy", "Di"],
      mySeat: 2,
    },
    game: { stateVersion: 1, view },
  };
}
