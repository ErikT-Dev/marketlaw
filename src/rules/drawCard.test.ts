import { describe, expect, it } from "vitest";
import type { CardName } from "../shared/catalogue/CardName";
import { drawCard } from "./drawCard";
import type { Random } from "./Random";

const NO_RANDOM: Random = {
  pickSector: () => "Residential",
  pickTier: () => 1,
  pickQuest: (candidates) => candidates[0] ?? "Farmland",
  pickType: (candidates) => candidates[0] ?? "Farm",
  shuffle: (cards) => [...cards].reverse(),
};

function piles(deck: ReadonlyArray<CardName>, discard: ReadonlyArray<CardName> = []) {
  return { deck, discard };
}

describe("drawCard", () => {
  it("takes the first card of the sector and tier from the top of the deck", () => {
    const drawn = drawCard(piles(["Pub", "Row House", "Small Home"]), { by: "sector", sector: "Residential" }, 1, NO_RANDOM);
    expect(drawn).toEqual({ cards: ["Row House"], piles: piles(["Pub", "Small Home"]) });
  });

  it("shuffles matching discards into the deck when the deck has none", () => {
    const drawn = drawCard(piles(["Pub"], ["Row House", "Library"]), { by: "sector", sector: "Residential" }, 1, NO_RANDOM);
    expect(drawn).toEqual({ cards: ["Row House"], piles: piles(["Pub"], ["Library"]) });
  });

  it("uses the nearest other tier, the lower one first", () => {
    const drawn = drawCard(piles(["Pub", "Brownstone", "Row House"]), { by: "sector", sector: "Residential" }, 3, NO_RANDOM);
    expect(drawn.cards).toEqual(["Brownstone"]);
  });

  it("takes the top card of any sector when none of the sector is left", () => {
    const drawn = drawCard(piles(["Pub", "Library"]), { by: "sector", sector: "Residential" }, 1, NO_RANDOM);
    expect(drawn.cards).toEqual(["Pub"]);
  });

  it("shuffles the whole discard pile into an empty deck before taking the top card", () => {
    const drawn = drawCard(piles([], ["Pub", "Library"]), { by: "sector", sector: "Industry" }, 1, NO_RANDOM);
    expect(drawn).toEqual({ cards: ["Library"], piles: piles(["Pub"], []) });
  });

  it("draws nothing when no cards are left", () => {
    expect(drawCard(piles([]), { by: "sector", sector: "Service" }, 2, NO_RANDOM).cards).toEqual([]);
  });

  it("never takes a card of another kind for a kind", () => {
    const drawn = drawCard(piles(["Pub"]), { by: "kind", kind: "Public quality card" }, 1, NO_RANDOM);
    expect(drawn).toEqual({ cards: [], piles: piles(["Pub"]) });
  });
});
