import type { Tier } from "../shared/catalogue/Tier";
import type { Random } from "./Random";
import type { TierChances } from "./TierChances";

const TIERS = [1, 2, 3] as const;

export function pickTier(chances: TierChances, random: Random): Tier {
  const possible = TIERS.filter((tier) => chances[tier] > 0);
  const [onlyTier] = possible;
  return possible.length === 1 && onlyTier !== undefined ? onlyTier : random.pickTier(chances);
}
