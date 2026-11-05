import { describe, expect, it } from "vitest";
import { busyDayTotal } from "./busyDayTotal.ts";
import { simulateBusyDay } from "./simulateBusyDay.ts";

describe("the busy-day simulator", () => {
  it("counts the exact rows a day of 50 rooms writes outside its games, the end of each room included", () => {
    const { written } = simulateBusyDay();
    expect(written).toEqual({ room: 647, alarm: 448, lobby: 681, database: 750 });
    expect(busyDayTotal(written)).toBe(2526);
  });

  it("counts the rows the rooms, the lobby and the token lookups read outside the games", () => {
    expect(simulateBusyDay().rowsRead).toBe(2938);
  });

  it("gives the same count every time", () => {
    expect(simulateBusyDay()).toEqual(simulateBusyDay());
  });
});
