import type { Sector } from "../../shared/catalogue/Sector";
import type { SectorStatEffects } from "./SectorStatEffects";

export const SECTOR_STAT_EFFECTS: Readonly<Record<Sector, SectorStatEffects>> = {
  Residential: { gives: ["workforce"], usesUp: ["quality", "satisfaction"] },
  Industry: { gives: ["product"], usesUp: ["workforce", "quality", "satisfaction"] },
  Service: { gives: ["distribution"], usesUp: ["workforce", "quality", "satisfaction"] },
  Public: { gives: ["quality", "satisfaction"], usesUp: ["workforce"] },
};
