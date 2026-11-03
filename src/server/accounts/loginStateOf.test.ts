import { describe, expect, it } from "vitest";
import { loginStateOf } from "./loginStateOf";

const DAY_MS = 86_400_000;

describe("loginStateOf", () => {
  it("keeps a login used within the last day without recording the use again", () => {
    expect(loginStateOf(0, DAY_MS)).toBe("fresh");
  });

  it("records the use when the last recorded use is more than a day old", () => {
    expect(loginStateOf(0, DAY_MS + 1)).toBe("record_use");
    expect(loginStateOf(0, 90 * DAY_MS)).toBe("record_use");
  });

  it("ends a login whose recorded last use is more than 91 days ago, never sooner than 90", () => {
    expect(loginStateOf(0, 91 * DAY_MS)).toBe("record_use");
    expect(loginStateOf(0, 91 * DAY_MS + 1)).toBe("expired");
  });
});
