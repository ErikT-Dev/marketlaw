import type { MarketplaceSlot } from "../shared/MarketplaceSlot";
import type { DiscardShuffle } from "./DiscardShuffle";
import type { Piles } from "./Piles";

export type MarketplaceFill = {
  readonly marketplace: ReadonlyArray<MarketplaceSlot>;
  readonly piles: Piles;
  readonly shuffles: ReadonlyArray<DiscardShuffle>;
};
