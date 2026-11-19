import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { PlayerId } from "../../shared/PlayerId";
import { PLAYER_ICON_COLOR_COUNT } from "../../shared/PLAYER_ICON_COLOR_COUNT";
import { playerIconColorOf } from "./playerIconColorOf";

function playerIdOf(number: number): PlayerId {
  const hex = number.toString(16).padStart(12, "0");
  return v.parse(PlayerId, `5b0f6a52-3d5e-4f7c-8a41-${hex}`);
}

describe("player icon colours", () => {
  it("picks the same icon colour for the same account every time", () => {
    const id = playerIdOf(7);
    expect(playerIconColorOf(id)).toBe(playerIconColorOf(playerIdOf(7)));
  });

  it("picks one of the 12 icon colours and uses all of them across accounts", () => {
    const colors = Array.from({ length: 200 }, (unused, index) =>
      playerIconColorOf(playerIdOf(index)),
    );
    expect(colors.every((color) => Number.isInteger(color) && color >= 0 && color < 12)).toBe(true);
    expect(new Set(colors).size).toBe(PLAYER_ICON_COLOR_COUNT);
  });
});
