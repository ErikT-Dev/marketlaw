import { describe, expect, it } from "vitest";
import { areIconColorsTooAlike } from "../../shared/playerIcons/areIconColorsTooAlike";
import { PLAYER_ICON_PICTURES } from "../../shared/playerIcons/PLAYER_ICON_PICTURES";
import { PlayerId } from "../../shared/PlayerId";
import * as v from "valibot";
import { iconOfOlderAccount } from "./iconOfOlderAccount";
import { randomPlayerIcon } from "./randomPlayerIcon";

describe("a random player icon", () => {
  it("is a picture of the folder with colours that pass the contrast check", () => {
    const icons = Array.from({ length: 200 }, () => randomPlayerIcon());
    for (const { picture, background, color } of icons) {
      expect(PLAYER_ICON_PICTURES).toContain(picture);
      expect(background).toMatch(/^#[0-9a-f]{6}$/u);
      expect(areIconColorsTooAlike(background, color)).toBe(false);
    }
    expect(new Set(icons.map(({ picture }) => picture)).size).toBeGreaterThan(20);
  });

  it("is the same every time for an account made before player icons had pictures", () => {
    const playerId = v.parse(PlayerId, "5b0f6a52-3d5e-4f7c-8a41-6c2b9e0d7f13");
    const icon = iconOfOlderAccount(playerId);
    expect(iconOfOlderAccount(playerId)).toEqual(icon);
    expect(areIconColorsTooAlike(icon.background, icon.color)).toBe(false);
  });
});
