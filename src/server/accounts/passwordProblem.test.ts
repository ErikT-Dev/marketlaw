import { describe, expect, it } from "vitest";
import { passwordProblem } from "./passwordProblem";

describe("passwordProblem", () => {
  it("accepts passwords of 8 to 64 characters", () => {
    expect(passwordProblem("a".repeat(8))).toBeNull();
    expect(passwordProblem("a".repeat(64))).toBeNull();
  });

  it("rejects a password shorter than 8 or longer than 64 characters", () => {
    expect(passwordProblem("a".repeat(7))).toBe("password_invalid");
    expect(passwordProblem("a".repeat(65))).toBe("password_invalid");
    expect(passwordProblem("")).toBe("password_invalid");
  });

  it("counts characters as the player sees them", () => {
    const family = "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}";
    expect(passwordProblem(family.repeat(8))).toBeNull();
    expect(passwordProblem(family.repeat(7))).toBe("password_invalid");
    expect(passwordProblem("e\u0301".repeat(64))).toBeNull();
  });
});
