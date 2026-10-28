import type { Sector } from "../shared/catalogue/Sector";
import type { Tier } from "../shared/catalogue/Tier";
import { drawCard } from "./drawCard";
import type { HandDeal } from "./HandDeal";
import type { Piles } from "./Piles";
import { pickTier } from "./pickTier";
import type { Random } from "./Random";

const FIXED_SECTORS = ["Residential", "Industry", "Service", "Public"] as const;
const RANDOM_CARD_CHANCES = [
  { 1: 1, 2: 0, 3: 0 },
  { 1: 0.5, 2: 0.5, 3: 0 },
  { 1: 1 / 3, 2: 1 / 3, 3: 1 / 3 },
] as const;

function dealOne(deal: HandDeal, sector: Sector, tier: Tier, random: Random): HandDeal {
  const drawn = drawCard(deal.piles, { by: "sector", sector }, tier, random, "top_card");
  return {
    hand: [...deal.hand, ...drawn.cards],
    piles: drawn.piles,
  };
}

export function dealStartingHand(piles: Piles, random: Random): HandDeal {
  const fixed = FIXED_SECTORS.reduce<HandDeal>(
    (deal, sector) => dealOne(deal, sector, 1, random),
    { hand: [], piles },
  );
  return RANDOM_CARD_CHANCES.reduce<HandDeal>((deal, chances) => {
    const sector = random.pickSector();
    return dealOne(deal, sector, pickTier(chances, random), random);
  }, fixed);
}
