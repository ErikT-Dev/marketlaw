import { describe, expect, it } from "vitest";
import { decideUsernameChange } from "./decideUsernameChange";
import { USERNAME_CHANGE_WAIT_MS } from "./USERNAME_CHANGE_WAIT_MS";

const CHANGE = { currentName: "Ann", wantedName: "Ann City", changedMs: null, now: 1_000 };

function takenAs(isTaken: boolean) {
  return () => Promise.resolve(isTaken);
}

describe("decideUsernameChange", () => {
  it("renames an account that never changed its name", async () => {
    expect(await decideUsernameChange(CHANGE, takenAs(false))).toEqual({ kind: "renamed" });
  });

  it("refuses a change within 7 days of the last one", async () => {
    const tooSoon = { ...CHANGE, changedMs: 0, now: USERNAME_CHANGE_WAIT_MS - 1 };
    expect(await decideUsernameChange(tooSoon, takenAs(false))).toEqual({
      kind: "refused",
      reason: "username_change_too_soon",
    });
  });

  it("allows a change exactly 7 days after the last one", async () => {
    const onTime = { ...CHANGE, changedMs: 0, now: USERNAME_CHANGE_WAIT_MS };
    expect(await decideUsernameChange(onTime, takenAs(false))).toEqual({ kind: "renamed" });
  });

  it("checks the name itself before the 7 days and the 7 days before taken", async () => {
    const tooSoon = { ...CHANGE, changedMs: 0, now: 1 };
    expect(await decideUsernameChange({ ...tooSoon, wantedName: "A" }, takenAs(true))).toEqual({
      kind: "refused",
      reason: "username_invalid",
    });
    expect(await decideUsernameChange(tooSoon, takenAs(true))).toEqual({
      kind: "refused",
      reason: "username_change_too_soon",
    });
    expect(await decideUsernameChange(CHANGE, takenAs(true))).toEqual({
      kind: "refused",
      reason: "username_taken",
    });
  });

  it("refuses the reserved name", async () => {
    const reserved = { ...CHANGE, wantedName: "deleted Player" };
    expect(await decideUsernameChange(reserved, takenAs(false))).toEqual({
      kind: "refused",
      reason: "username_reserved",
    });
  });

  it("changes nothing for the same name even within the 7 days", async () => {
    const same = { ...CHANGE, wantedName: "Ann", changedMs: 0, now: 1 };
    expect(await decideUsernameChange(same, takenAs(true))).toEqual({ kind: "unchanged" });
  });

  it("treats other capitals of the own name as a change that is not taken", async () => {
    const capitals = { ...CHANGE, wantedName: "ANN" };
    expect(await decideUsernameChange(capitals, takenAs(true))).toEqual({ kind: "renamed" });
  });
});
