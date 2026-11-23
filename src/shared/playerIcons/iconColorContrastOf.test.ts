import { describe, expect, it } from "vitest";
import { areIconColorsTooAlike } from "./areIconColorsTooAlike";
import { iconColorContrastOf } from "./iconColorContrastOf";

describe("the contrast between icon colours", () => {
  it("is 21 between black and white and 1 between a colour and itself", () => {
    expect(iconColorContrastOf("#000000", "#ffffff")).toBeCloseTo(21);
    expect(iconColorContrastOf("#ffffff", "#000000")).toBeCloseTo(21);
    expect(iconColorContrastOf("#1e3a8a", "#1e3a8a")).toBe(1);
  });

  it("finds colours under 3 to 1 too alike", () => {
    expect(areIconColorsTooAlike("#777777", "#888888")).toBe(true);
    expect(areIconColorsTooAlike("#767676", "#ffffff")).toBe(false);
    expect(areIconColorsTooAlike("#1e3a8a", "#fde68a")).toBe(false);
  });
});
