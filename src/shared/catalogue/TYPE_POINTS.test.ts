import { describe, expect, it } from "vitest";
import { TYPE_NAMES } from "./TYPE_NAMES";
import { TYPE_POINTS } from "./TYPE_POINTS";

describe("TYPE_POINTS", () => {
  it("gives each of the 33 types 2, 3 or 4 points", () => {
    expect(Object.keys(TYPE_POINTS)).toHaveLength(33);
    expect(TYPE_POINTS.Office).toBe(2);
    expect(TYPE_POINTS.Farm).toBe(3);
    expect(TYPE_POINTS["Rental Space"]).toBe(4);
  });

  it("lists the types in the order of R21.7", () => {
    expect(TYPE_NAMES.slice(0, 2)).toEqual(["Suburban Housing", "Low Wealth"]);
    expect(TYPE_NAMES.at(-1)).toBe("Rental Space");
    expect(Object.keys(TYPE_POINTS)).toEqual(TYPE_NAMES);
  });
});
