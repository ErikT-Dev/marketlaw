import type { Sector } from "../../shared/catalogue/Sector";
import type { Tier } from "../../shared/catalogue/Tier";

export function sectorColor(
  sector: Sector,
  tier: Tier | "card" | "light" | "solid" | "solid-text",
): string {
  const shade = typeof tier === "number" ? `tier${String(tier)}` : tier;
  return `var(--color-sector-${sector.toLowerCase()}-${shade})`;
}
