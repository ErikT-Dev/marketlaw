import { Kind } from "../../shared/catalogue/Kind";
import { Tier } from "../../shared/catalogue/Tier";
import type { OwnSeatView } from "../../shared/OwnSeatView";
import type { PlayerView } from "../../shared/PlayerView";
import { OWN_SEAT_VIEW } from "../../shared/testing/OWN_SEAT_VIEW";
import { TradeName } from "../../shared/TradeName";

const OWN_SEAT: OwnSeatView = {
  ...OWN_SEAT_VIEW,
  hand: ["Farm House", "Dorm", "Pub", "Cottage", "Loft"],
  handDetails: [
    { card: "Farm House", realCost: 4, sameSectorAndTierInCity: 0, playRejection: null },
    { card: "Dorm", realCost: 9, sameSectorAndTierInCity: 0, playRejection: "tier_not_allowed" },
    { card: "Pub", realCost: 5, sameSectorAndTierInCity: 0, playRejection: null },
    { card: "Cottage", realCost: 4, sameSectorAndTierInCity: 0, playRejection: null },
    { card: "Loft", realCost: 8, sameSectorAndTierInCity: 0, playRejection: "tier_not_allowed" },
  ],
  trades: TradeName.options.map((trade) => ({ trade, rejection: "cannot_afford_trade" })),
  drawActions: Kind.options.flatMap((kind) =>
    Tier.options.map((tier) => ({
      kind,
      tier,
      isAnyLeft: true,
      rejection: "cannot_afford_trade",
    })),
  ),
};

export function botViewWith(own: Partial<OwnSeatView>): PlayerView {
  return {
    seat: 1,
    turn: 1,
    phase: "main",
    firstPlayer: 1,
    marketGo: null,
    seats: [{ ...OWN_SEAT, ...own }],
    deckCount: 200,
    discard: [],
    marketplace: [],
    quests: [],
    bonusTypes: [],
    doneOrder: [],
    playerOrder: [1],
    drawLog: [],
    firstCompletions: [],
    result: null,
  };
}
