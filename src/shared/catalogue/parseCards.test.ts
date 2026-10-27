import { describe, expect, it } from "vitest";
import cardList from "../../../harness/spec/cards.json" with { type: "json" };
import { parseCards } from "./parseCards";

const [FIRST_CARD] = cardList;
const ALONE = {
  ...FIRST_CARD,
  c4ReqN: null,
  c4ReqType: "",
  c4GainsN: null,
  c4GainsType: "",
  c4Infinite: null,
};

function problemsOf(raw: unknown): ReadonlyArray<string> {
  const parsed = parseCards(raw);
  return parsed.isOk ? [] : parsed.error;
}

describe("parseCards", () => {
  it("accepts the card list", () => {
    expect(problemsOf(cardList)).toEqual([]);
  });

  it("rejects a card with a missing field", () => {
    const withoutCost = Object.fromEntries(Object.entries(ALONE).filter(([key]) => key !== "cost"));
    expect(problemsOf([withoutCost])).toEqual([
      '0.cost: Invalid key: Expected "cost" but received undefined',
    ]);
  });

  it("rejects a card with an unknown type", () => {
    expect(problemsOf([{ ...ALONE, type1: "Castle" }])).toEqual([
      'Farm House: type "Castle" is not one of the 33 types',
    ]);
  });

  it("rejects a card that lists a type twice", () => {
    expect(problemsOf([{ ...ALONE, type2: "Suburban Housing" }])).toEqual([
      'Farm House: type "Suburban Housing" is listed twice',
    ]);
  });

  it("rejects a card without types", () => {
    expect(problemsOf([{ ...ALONE, type1: "", type2: "" }])).toEqual(["Farm House: has no types"]);
  });

  it("rejects an incomplete combo", () => {
    expect(problemsOf([{ ...ALONE, c1GainsN: null }])).toEqual([
      "Farm House: combo 1 is incomplete",
    ]);
  });

  it("rejects a combo that needs neither a type nor a card", () => {
    expect(problemsOf([{ ...FIRST_CARD, c4ReqType: "Moon Base" }])).toEqual([
      'Farm House: combo 4 needs "Moon Base", neither a type nor a card',
    ]);
  });

  it("rejects a card name combo with a count above 1", () => {
    const second = { ...FIRST_CARD, cardId: 2, cardName: "Farmers Market" };
    expect(problemsOf([{ ...FIRST_CARD, c4ReqN: 2 }, second])).toEqual([
      "Farm House: combo 4 names a card but has a count or is infinite",
    ]);
  });
});
