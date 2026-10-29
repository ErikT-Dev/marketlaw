import { Kind } from "../shared/catalogue/Kind";
import { Tier } from "../shared/catalogue/Tier";
import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import { kindTierCountsOf } from "./kindTierCountsOf";
import { kindTierKey } from "./kindTierKey";
import { seatOf } from "./seatOf";

const ALL_KIND_TIER_KEYS = Kind.options.flatMap((kind) =>
  Tier.options.map((tier) => kindTierKey(kind, tier)),
);

export function kindTiersLeftAsSeenBy(state: GameState, viewer: SeatNumber): ReadonlyArray<string> {
  const counts =
    state.phase === "main"
      ? kindTierCountsOf(
          seatOf(state, viewer)?.drawnThisPhase ?? [],
          state.mainPhaseStart.kindTierCounts,
          -1,
        )
      : kindTierCountsOf([...state.deck, ...state.discard]);
  return ALL_KIND_TIER_KEYS.filter((key) => (counts[key] ?? 0) > 0);
}
