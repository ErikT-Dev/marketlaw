import { describe, expect, it } from "vitest";
import { CARDS } from "./CARDS";

function cardNamed(name: string) {
  const card = CARDS.find((candidate) => candidate.name === name);
  if (card === undefined) {
    throw new Error(`no card named ${name}`);
  }
  return card;
}

describe("CARDS", () => {
  it("loads all 240 cards from the card list", () => {
    expect(CARDS).toHaveLength(240);
  });

  it("reads a card's sector, tier, base cost, stats and photo", () => {
    const card = cardNamed("Farm House");
    expect(card.sector).toBe("Residential");
    expect(card.tier).toBe(1);
    expect(card.baseCost).toBe(4);
    expect(card.stats).toEqual({
      workforce: 2,
      quality: 1,
      satisfaction: 1,
      product: 0,
      distribution: 0,
    });
    expect(card.photo).toBe("alex-kotomanov--1aHfrSVA5Y-unsplash.jpg");
  });

  it("reads sales as distribution", () => {
    expect(cardNamed("Fast Food Restaurant").stats.distribution).toBe(1);
  });

  it("counts a double type twice and other types once", () => {
    expect(cardNamed("Repetitive Housing").types).toEqual([
      { type: "Town Housing", count: 1 },
      { type: "Low Wealth", count: 2 },
    ]);
  });

  it("reads type count combos with their infinite flag and card name combos", () => {
    const combos = cardNamed("Countryside Stone House").combos;
    expect(combos[0]).toEqual({
      kind: "type_count",
      type: "Farm",
      count: 2,
      isInfinite: true,
      gains: { stat: "quality", amount: 1 },
    });
    expect(combos[2]).toEqual({
      kind: "card_name",
      card: "Publisher",
      gains: { stat: "quality", amount: 1 },
    });
  });

  it("leaves out empty combo places", () => {
    expect(cardNamed("Fast Food Restaurant").combos).toEqual([
      {
        kind: "type_count",
        type: "Food",
        count: 2,
        isInfinite: true,
        gains: { stat: "satisfaction", amount: 1 },
      },
      {
        kind: "type_count",
        type: "Low Wealth",
        count: 1,
        isInfinite: false,
        gains: { stat: "satisfaction", amount: 1 },
      },
      { kind: "card_name", card: "Landfill", gains: { stat: "quality", amount: 1 } },
    ]);
  });
});
