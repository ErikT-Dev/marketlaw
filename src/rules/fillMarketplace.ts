import type { MarketplaceSlot } from "../shared/MarketplaceSlot";
import { drawCard } from "./drawCard";
import type { Drawn } from "./Drawn";
import { MARKETPLACE_PLACES } from "./MARKETPLACE_PLACES";
import type { MarketplaceFill } from "./MarketplaceFill";
import type { Piles } from "./Piles";
import { pickTier } from "./pickTier";
import type { Random } from "./Random";
import { tierChancesByTurn } from "./tierChancesByTurn";

function drawForPlace(slot: MarketplaceSlot, piles: Piles, turn: number, random: Random): Drawn {
  const kind = MARKETPLACE_PLACES[slot.place];
  const chances = tierChancesByTurn(turn);
  if (kind === "open") {
    const sector = random.pickSector();
    return drawCard(piles, { by: "sector", sector }, pickTier(chances, random), random, "top_card");
  }
  return drawCard(piles, { by: "kind", kind }, pickTier(chances, random), random, "nothing");
}

export function fillMarketplace(
  marketplace: ReadonlyArray<MarketplaceSlot>,
  piles: Piles,
  turn: number,
  random: Random,
): MarketplaceFill {
  return marketplace.reduce<MarketplaceFill>(
    (filled, slot) => {
      if (slot.card !== null) {
        return { marketplace: [...filled.marketplace, slot], piles: filled.piles };
      }
      const drawn = drawForPlace(slot, filled.piles, turn, random);
      const card = drawn.cards[0] ?? null;
      return {
        marketplace: [...filled.marketplace, { ...slot, card, phasesShown: 0 }],
        piles: drawn.piles,
      };
    },
    { marketplace: [], piles },
  );
}
