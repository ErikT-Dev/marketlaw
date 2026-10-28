import type { CardName } from "../shared/catalogue/CardName";
import type { Tier } from "../shared/catalogue/Tier";
import type { DrawAsked } from "../shared/DrawAsked";
import type { Drawn } from "./Drawn";
import { isAskedCard } from "./isAskedCard";
import type { DrawTarget } from "./DrawTarget";
import type { Piles } from "./Piles";
import type { Random } from "./Random";

const NEAREST_TIERS = { 1: [1, 2, 3], 2: [2, 1, 3], 3: [3, 2, 1] } as const;

function askedFor(target: DrawTarget, tier: Tier): DrawAsked {
  return target.by === "sector"
    ? { by: "sector", sector: target.sector, tier }
    : { by: "kind", kind: target.kind, tier };
}

function isMatch(name: CardName, target: DrawTarget, tier: Tier): boolean {
  return isAskedCard(name, askedFor(target, tier));
}

function takeAt(piles: Piles, index: number): Pick<Drawn, "piles" | "cards"> {
  return {
    piles: {
      deck: [...piles.deck.slice(0, index), ...piles.deck.slice(index + 1)],
      discard: piles.discard,
    },
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
    return { ...takeAt(piles, inDeck), shuffles: [] };
  }
  const fromDiscard = piles.discard.filter((name) => isMatch(name, target, tier));
  if (fromDiscard.length === 0) {
    return undefined;
  }
  const deck = random.shuffle([...piles.deck, ...fromDiscard]);
  const discard = piles.discard.filter((name) => !isMatch(name, target, tier));
  return {
    ...takeAt({ deck, discard }, deck.findIndex((name) => isMatch(name, target, tier))),
    shuffles: [{ asked: askedFor(target, tier), count: fromDiscard.length }],
  };
}

function takeTopCard(piles: Piles, random: Random): Drawn {
  if (piles.deck.length > 0) {
    return { ...takeAt(piles, 0), shuffles: [] };
  }
  if (piles.discard.length === 0) {
    return { piles, cards: [], shuffles: [] };
  }
  return {
    ...takeAt({ deck: random.shuffle(piles.discard), discard: [] }, 0),
    shuffles: [{ asked: null, count: piles.discard.length }],
  };
}

export function drawCard(piles: Piles, target: DrawTarget, tier: Tier, random: Random): Drawn {
  for (const nearestTier of NEAREST_TIERS[tier]) {
    const drawn = takeMatching(piles, target, nearestTier, random);
    if (drawn !== undefined) {
      return drawn;
    }
  }
  return target.by === "kind" ? { piles, cards: [], shuffles: [] } : takeTopCard(piles, random);
}
