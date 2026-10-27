import type { Sector } from "../../shared/catalogue/Sector";
import type { Tier } from "../../shared/catalogue/Tier";

export function sectorColor(sector: Sector, tier: Tier | "card"): string {
  const shade = tier === "card" ? "card" : `tier${String(tier)}`;
  return `var(--color-sector-${sector.toLowerCase()}-${shade})`;
}
