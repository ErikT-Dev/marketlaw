import { describe, expect, it } from "vitest";
import { PROTOCOL_VERSION } from "./PROTOCOL_VERSION";

describe("PROTOCOL_VERSION", () => {
  it("is a positive whole number", () => {
    expect(Number.isInteger(PROTOCOL_VERSION)).toBe(true);
    expect(PROTOCOL_VERSION).toBeGreaterThan(0);
  });
});
