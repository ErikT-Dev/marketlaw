import { describe, expect, it } from "vitest";
import { usernameChangeAllowedAt } from "./usernameChangeAllowedAt";
import { USERNAME_CHANGE_WAIT_MS } from "./USERNAME_CHANGE_WAIT_MS";

describe("usernameChangeAllowedAt", () => {
  it("allows a change at once when the name was never changed", () => {
    expect(usernameChangeAllowedAt(null, 5_000)).toBeNull();
  });

  it("gives the time 7 days after the last change while the wait runs", () => {
    expect(usernameChangeAllowedAt(1_000, USERNAME_CHANGE_WAIT_MS)).toBe(
      1_000 + USERNAME_CHANGE_WAIT_MS,
    );
  });

  it("allows a change once the 7 days have passed", () => {
    expect(usernameChangeAllowedAt(1_000, 1_000 + USERNAME_CHANGE_WAIT_MS)).toBeNull();
  });
});
