import { describe, expect, it } from "vitest";
import { usernameChangeAllowedAt } from "./usernameChangeAllowedAt";
import { usernameChangesWith } from "./usernameChangesWith";
import { USERNAME_CHANGE_WAIT_MS } from "./USERNAME_CHANGE_WAIT_MS";

describe("usernameChangeAllowedAt", () => {
  it("allows a change at once when the name was never changed", () => {
    expect(usernameChangeAllowedAt([], 5_000)).toBeNull();
  });

  it("allows a change while fewer than 4 were made in the 7 days before", () => {
    expect(usernameChangeAllowedAt([1_000, 2_000, 3_000], 4_000)).toBeNull();
  });

  it("gives the time 7 days after the first of the last 4 changes while the wait runs", () => {
    expect(usernameChangeAllowedAt([1_000, 2_000, 3_000, 4_000], USERNAME_CHANGE_WAIT_MS)).toBe(
      1_000 + USERNAME_CHANGE_WAIT_MS,
    );
  });

  it("allows a change once the first of the last 4 changes is 7 days old", () => {
    expect(
      usernameChangeAllowedAt([1_000, 2_000, 3_000, 4_000], 1_000 + USERNAME_CHANGE_WAIT_MS),
    ).toBeNull();
  });
});

describe("usernameChangesWith", () => {
  it("keeps at most the last 3 changes of the 7 days before and adds the new one", () => {
    const now = 10_000 + USERNAME_CHANGE_WAIT_MS;
    expect(usernameChangesWith([5_000, 10_000, 11_000, 12_000, 13_000], now)).toEqual([
      11_000,
      12_000,
      13_000,
      now,
    ]);
  });
});
