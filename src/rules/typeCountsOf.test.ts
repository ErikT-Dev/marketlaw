import { describe, expect, it } from "vitest";
import { newSeat } from "./newSeat";
import { typeCountsOf } from "./typeCountsOf";

describe("typeCountsOf", () => {
  it("adds types gained from quests to the types of the cards in the city", () => {
    const seat = { ...newSeat(1), city: ["Farm House" as const], gainedTypes: { Farm: 1, "Low Wealth": 1 } };
    expect(typeCountsOf(seat)).toEqual({ "Suburban Housing": 1, "Low Wealth": 2, Farm: 1 });
  });
});
