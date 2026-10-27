import type { MarketplaceSlot } from "../shared/MarketplaceSlot";
import type { Piles } from "./Piles";

export type MarketplaceFill = {
  readonly marketplace: ReadonlyArray<MarketplaceSlot>;
  readonly piles: Piles;
};
