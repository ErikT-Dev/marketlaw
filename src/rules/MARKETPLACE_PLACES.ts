import type { Kind } from "../shared/catalogue/Kind";
import type { MarketplacePlace } from "../shared/MarketplacePlace";

export const MARKETPLACE_PLACES: Readonly<Record<MarketplacePlace, Kind | "open">> = {
  residential: "Residential",
  industry: "Industry",
  service: "Service",
  public_quality: "Public quality card",
  public_satisfaction: "Public satisfaction card",
  open_1: "open",
  open_2: "open",
  open_3: "open",
};
