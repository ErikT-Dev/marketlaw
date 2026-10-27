import type { CardName } from "../shared/catalogue/CardName";
import { cardOf } from "../shared/catalogue/cardOf";
import { kindOf } from "../shared/catalogue/kindOf";
import type { Tier } from "../shared/catalogue/Tier";
import type { Drawn } from "./Drawn";
import type { DrawTarget } from "./DrawTarget";
import type { Piles } from "./Piles";
import type { Random } from "./Random";

const NEAREST_TIERS = { 1: [1, 2, 3], 2: [2, 1, 3], 3: [3, 2, 1] } as const;

function isMatch(name: CardName, target: DrawTarget, tier: Tier): boolean {
  const card = cardOf(name);
  const isSameTarget =
    target.by === "sector" ? card.sector === target.sector : kindOf(card) === target.kind;
  return isSameTarget && card.tier === tier;
}

function takeAt(piles: Piles, index: number): Drawn {
  return {
    piles: { deck: [...piles.deck.slice(0, index), ...piles.deck.slice(index + 1)], discard: piles.discard },
    cards: piles.deck.slice(index, index + 1),
  };
}

function takeMatching(
  piles: Piles,
  target: DrawTarget,
  tier: Tier,
  random: Random,
): Drawn | undefined {
  const inDeck = piles.deck.findIndex((name) => isMatch(name, target, tier));
  if (inDeck >= 0) {
    return takeAt(piles, inDeck);
  }
  const fromDiscard = piles.discard.filter((name) => isMatch(name, target, tier));
  if (fromDiscard.length === 0) {
    return undefined;
  }
  const deck = random.shuffle([...piles.deck, ...fromDiscard]);
  const discard = piles.discard.filter((name) => !isMatch(name, target, tier));
  return takeAt({ deck, discard }, deck.findIndex((name) => isMatch(name, target, tier)));
}

function takeTopCard(piles: Piles, random: Random): Drawn {
  if (piles.deck.length > 0) {
    return takeAt(piles, 0);
  }
  if (piles.discard.length === 0) {
    return { piles, cards: [] };
  }
  return takeAt({ deck: random.shuffle(piles.discard), discard: [] }, 0);
}

export function drawCard(piles: Piles, target: DrawTarget, tier: Tier, random: Random): Drawn {
  for (const nearestTier of NEAREST_TIERS[tier]) {
    const drawn = takeMatching(piles, target, nearestTier, random);
    if (drawn !== undefined) {
      return drawn;
    }
  }
  return target.by === "kind" ? { piles, cards: [] } : takeTopCard(piles, random);
}
