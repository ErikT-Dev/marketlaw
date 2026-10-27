import { describe, expect, it } from "vitest";
import { CARD_NAMES } from "../shared/catalogue/CARD_NAMES";
import { seededRandom } from "./seededRandom";

describe("seededRandom", () => {
  it("gives the same results for the same seed and stream", () => {
    const first = seededRandom(3, 1);
    const second = seededRandom(3, 1);
    expect([first.pickSector(), first.pickTier({ 1: 0.5, 2: 0.5, 3: 0 })]).toEqual([
      second.pickSector(),
      second.pickTier({ 1: 0.5, 2: 0.5, 3: 0 }),
    ]);
  });

  it("gives other results for another stream", () => {
    expect(seededRandom(3, 1).shuffle(CARD_NAMES)).not.toEqual(seededRandom(3, 2).shuffle(CARD_NAMES));
  });

  it("shuffles into an order of exactly the same cards", () => {
    const shuffled = seededRandom(9, 0).shuffle(CARD_NAMES);
    expect(shuffled).not.toEqual(CARD_NAMES);
    expect([...shuffled].sort()).toEqual([...CARD_NAMES].sort());
  });

  it("picks only tiers that have a chance", () => {
    const random = seededRandom(1, 0);
    const tiers = Array.from({ length: 50 }, () => random.pickTier({ 1: 0, 2: 0.5, 3: 0.5 }));
    expect(tiers.every((tier) => tier !== 1)).toBe(true);
    expect(new Set(tiers)).toEqual(new Set([2, 3]));
  });

  it("picks quests and types from the candidates", () => {
    const random = seededRandom(2, 0);
    expect(["Farmland", "Countryside"]).toContain(random.pickQuest(["Farmland", "Countryside"]));
    expect(["Farm", "Food"]).toContain(random.pickType(["Farm", "Food"]));
  });

  it("refuses to pick from an empty list", () => {
    expect(() => seededRandom(2, 0).pickQuest([])).toThrow("cannot pick from an empty list");
  });
});
