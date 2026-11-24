import { describe, expect, it } from "vitest";
import cardList from "../../harness/spec/cards.json" with { type: "json" };
import { checkCardData } from "./checkCardData.ts";

function replaceCard(
  name: string,
  changes: Readonly<Record<string, unknown>>,
): ReadonlyArray<unknown> {
  return cardList.map((card) => (card.cardName === name ? { ...card, ...changes } : card));
}

describe("checkCardData", () => {
  it("passes the card list in the spec", () => {
    expect(checkCardData(cardList)).toEqual([]);
  });

  it("reports a card list without 240 cards", () => {
    expect(checkCardData(cardList.slice(1))).toEqual([
      "239 cards, not 240",
      "19 tier 1 Residential cards, not 20",
    ]);
  });

  it("reports a card with a missing field", () => {
    const withoutTier = cardList.map((card) =>
      Object.fromEntries(
        Object.entries(card).filter(([key]) => card.cardId !== 7 || key !== "tier"),
      ),
    );
    expect(checkCardData(withoutTier)).toEqual([
      '6.tier: Invalid key: Expected "tier" but received undefined',
    ]);
  });

  it("reports a base cost outside its tier's range", () => {
    expect(checkCardData(replaceCard("Farm House", { cost: 70 }))).toEqual([
      "Farm House: base cost 70 is outside 30-60 for tier 1",
    ]);
  });

  it("reports product or distribution that does not match the tier", () => {
    expect(checkCardData(replaceCard("Fast Food Restaurant", { sales: 2 }))).toEqual([
      "Fast Food Restaurant: distribution 2 is not 1 for tier 1",
    ]);
  });

  it("reports a card listed twice", () => {
    expect(checkCardData(replaceCard("Cottage", { cardName: "Farm House" }))).toEqual([
      '"Farm House" is listed twice',
    ]);
  });
});
