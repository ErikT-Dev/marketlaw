import { describe, expect, it } from "vitest";
import { tierChancesByTurn } from "./tierChancesByTurn";

function percentages(turn: number): ReadonlyArray<number> {
  const chances = tierChancesByTurn(turn);
  return [chances[1], chances[2], chances[3]].map((chance) => Math.round(chance * 100));
}

describe("tierChancesByTurn", () => {
  it("matches the table of R17.10", () => {
    expect(percentages(1)).toEqual([100, 0, 0]);
    expect(percentages(5)).toEqual([71, 29, 0]);
    expect(percentages(9)).toEqual([43, 57, 0]);
    expect(percentages(13)).toEqual([14, 67, 19]);
    expect(percentages(17)).toEqual([0, 58, 42]);
    expect(percentages(21)).toEqual([0, 34, 66]);
    expect(percentages(25)).toEqual([0, 11, 89]);
    expect(percentages(29)).toEqual([0, 0, 100]);
  });
});
