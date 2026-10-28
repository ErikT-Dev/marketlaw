import { describe, expect, it } from "vitest";
import { checkTierShares } from "./checkTierShares.ts";

describe("checkTierShares", () => {
  it("finds the engine's tier shares within 1 percentage point of R17.10 in every turn", () => {
    expect(checkTierShares(100_000)).toEqual([]);
  });

  it("reports turns whose shares are off when too few draws are made", () => {
    expect(checkTierShares(10).length).toBeGreaterThan(0);
  });
});
