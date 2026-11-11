import { Kind } from "../shared/catalogue/Kind";
import { Tier } from "../shared/catalogue/Tier";
import type { SeatNumber } from "../shared/SeatNumber";
import { cardsDrawnSinceStart } from "./cardsDrawnSinceStart";
import type { GameState } from "./GameState";
import { kindTierCountsOf } from "./kindTierCountsOf";
import { kindTierKey } from "./kindTierKey";
import { pilesStartShownTo } from "./pilesStartShownTo";

const ALL_KIND_TIER_KEYS = Kind.options.flatMap((kind) =>
  Tier.options.map((tier) => kindTierKey(kind, tier)),
);

export function kindTiersLeftAsSeenBy(state: GameState, viewer: SeatNumber): ReadonlyArray<string> {
  const start = pilesStartShownTo(state, viewer);
  const counts =
    start === null
      ? kindTierCountsOf([...state.deck, ...state.discard])
      : kindTierCountsOf(cardsDrawnSinceStart(state, viewer, start), start.kindTierCounts, -1);
  return ALL_KIND_TIER_KEYS.filter((key) => (counts[key] ?? 0) > 0);
}
