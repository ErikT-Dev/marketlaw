import type { MarketplacePlace } from "../../../shared/MarketplacePlace";

export const MARKETPLACE_PLACE_LABELS: Readonly<
  Record<
    MarketplacePlace,
    { readonly name: string; readonly stat: "quality" | "satisfaction" | null }
  >
> = {
  residential: { name: "Residential", stat: null },
  industry: { name: "Industry", stat: null },
  service: { name: "Service", stat: null },
  public_quality: { name: "Public", stat: "quality" },
  public_satisfaction: { name: "Public", stat: "satisfaction" },
  open_1: { name: "Open place 1", stat: null },
  open_2: { name: "Open place 2", stat: null },
  open_3: { name: "Open place 3", stat: null },
};
