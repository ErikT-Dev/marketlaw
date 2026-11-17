import { describe, expect, it } from "vitest";
import { checkRatings } from "./checkRatings.ts";

describe("checkRatings", () => {
  it("finds the A10 totals and the rounding of exactly 2.5 as the spec says", () => {
    expect(checkRatings()).toEqual([]);
  });
});
