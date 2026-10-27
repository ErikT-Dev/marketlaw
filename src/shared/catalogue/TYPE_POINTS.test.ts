import { describe, expect, it } from "vitest";
import { TYPE_POINTS } from "./TYPE_POINTS";

function pointsOf(typeName: string): number | undefined {
  return [...TYPE_POINTS.entries()].find(([type]) => type === typeName)?.[1];
}

describe("TYPE_POINTS", () => {
  it("gives each of the 33 types 2, 3 or 4 points", () => {
    expect(TYPE_POINTS.size).toBe(33);
    expect(pointsOf("Office")).toBe(2);
    expect(pointsOf("Farm")).toBe(3);
    expect(pointsOf("Rental Space")).toBe(4);
  });

  it("lists the types in the order of R21.7", () => {
    expect([...TYPE_POINTS.keys()].slice(0, 2)).toEqual(["Suburban Housing", "Low Wealth"]);
    expect([...TYPE_POINTS.keys()].at(-1)).toBe("Rental Space");
  });
});
