import type { Sector } from "../../shared/catalogue/Sector";
import type { Tier } from "../../shared/catalogue/Tier";
import { CARD_TEXTURE_URL } from "../icons/CARD_TEXTURE_URL";
import { sectorColor } from "./sectorColor";

export function cardTileBackground(sector: Sector, tier: Tier): string {
  const sectorShade = `color-mix(in srgb, ${sectorColor(sector, tier)} 80%, transparent)`;
  return `linear-gradient(${sectorShade}, ${sectorShade}), center / cover url("${CARD_TEXTURE_URL}")`;
}
