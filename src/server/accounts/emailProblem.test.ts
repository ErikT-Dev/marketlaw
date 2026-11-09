import { describe, expect, it } from "vitest";
import { emailProblem } from "./emailProblem";

describe("emailProblem", () => {
  it("accepts an address with one at sign and a dot after it", () => {
    expect(emailProblem("player@example.com")).toBeNull();
    expect(emailProblem("j.ohn+games@mail.example.co.uk")).toBeNull();
  });

  it("rejects an address without an at sign or with two", () => {
    expect(emailProblem("player.example.com")).toBe("email_invalid");
    expect(emailProblem("player@home@example.com")).toBe("email_invalid");
  });

  it("rejects an address with nothing before the at sign or no dot with something on both sides after it", () => {
    expect(emailProblem("@example.com")).toBe("email_invalid");
    expect(emailProblem("player@example")).toBe("email_invalid");
    expect(emailProblem("player@.com")).toBe("email_invalid");
    expect(emailProblem("player@example.")).toBe("email_invalid");
  });

  it("rejects an address with a space", () => {
    expect(emailProblem("play er@example.com")).toBe("email_invalid");
    expect(emailProblem(" player@example.com")).toBe("email_invalid");
  });

  it("accepts at most 254 characters", () => {
    const domain = "@example.com";
    expect(emailProblem(`${"a".repeat(254 - domain.length)}${domain}`)).toBeNull();
    expect(emailProblem(`${"a".repeat(255 - domain.length)}${domain}`)).toBe("email_invalid");
  });
});
