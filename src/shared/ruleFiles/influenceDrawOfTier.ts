import type { Tier } from "../catalogue/Tier";
import type { InfluenceDraw } from "./InfluenceDraw";
import { INFLUENCE_DRAWS } from "./INFLUENCE_DRAWS";

export function influenceDrawOfTier(tier: Tier): InfluenceDraw | undefined {
  return INFLUENCE_DRAWS.find((draw) => draw.tier === tier);
}
