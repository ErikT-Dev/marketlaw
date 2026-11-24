import type { Sector } from "../../shared/catalogue/Sector";
import type { Tier } from "../../shared/catalogue/Tier";
import { sectorColor } from "./sectorColor";

export function cardTileBackground(sector: Sector, tier: Tier): string {
  return `color-mix(in srgb, ${sectorColor(sector, tier)} 80%, transparent)`;
}
