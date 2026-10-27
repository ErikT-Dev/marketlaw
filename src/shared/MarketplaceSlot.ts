import type { CardName } from "./catalogue/CardName";
import type { MarketplacePlace } from "./MarketplacePlace";

export type MarketplaceSlot = {
  readonly place: MarketplacePlace;
  readonly card: CardName | null;
  readonly phasesShown: number;
};
