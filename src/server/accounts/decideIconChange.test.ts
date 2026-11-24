import { describe, expect, it } from "vitest";
import { TEST_PLAYER_ICON } from "../../shared/testing/TEST_PLAYER_ICON";
import { decideIconChange } from "./decideIconChange";
import { ICON_CHANGE_LIMIT } from "./ICON_CHANGE_LIMIT";

const WANTED = { picture: "delapouite/bear-head", background: "#000000", color: "#ffffff" };
const TEN_CHANGES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const CHANGE = { current: TEST_PLAYER_ICON, wanted: WANTED, changesMs: [], now: 100 };

describe("deciding an icon change", () => {
  it("changes to a picture of the folder with colours that differ enough", () => {
    expect(decideIconChange(CHANGE)).toEqual({ kind: "changed", icon: WANTED });
  });

  it("checks the picture first, then the colours, then the 10 changes in 24 hours", () => {
    const unknownAndAlike = {
      picture: "lorc/dragon-made-up",
      background: "#777777",
      color: "#888888",
    };
    const tooSoon = { ...CHANGE, changesMs: TEN_CHANGES };
    expect(decideIconChange({ ...tooSoon, wanted: unknownAndAlike })).toEqual({
      kind: "refused",
      reason: "unknown_icon",
    });
    expect(
      decideIconChange({ ...tooSoon, wanted: { ...unknownAndAlike, picture: "lorc/wolf-head" } }),
    ).toEqual({
      kind: "refused",
      reason: "icon_colors_too_alike",
    });
    expect(decideIconChange(tooSoon)).toEqual({ kind: "refused", reason: "icon_change_too_soon" });
  });

  it("allows the next change 24 hours after the oldest of the last 10", () => {
    const afterWait = { ...CHANGE, changesMs: TEN_CHANGES, now: ICON_CHANGE_LIMIT.waitMs };
    expect(decideIconChange(afterWait)).toEqual({ kind: "changed", icon: WANTED });
  });

  it("changes nothing for the icon the player already has, even after 10 changes", () => {
    const same = { ...CHANGE, wanted: TEST_PLAYER_ICON, changesMs: TEN_CHANGES };
    expect(decideIconChange(same)).toEqual({ kind: "unchanged" });
  });
});
