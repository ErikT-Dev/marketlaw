import { describe, expect, it } from "vitest";
import { busyDayTotal } from "./busyDayTotal.ts";
import { simulateBusyDay } from "./simulateBusyDay.ts";

describe("the busy-day simulator", () => {
  it("counts the exact rows a day of 50 rooms writes outside its games, the end of each room and the account actions included", () => {
    const { written } = simulateBusyDay();
    expect(written).toEqual({ room: 747, alarm: 448, lobby: 821, database: 1430 });
    expect(busyDayTotal(written)).toBe(3446);
  });

  it("counts the rows the rooms, the lobby and the token lookups read outside the games", () => {
    expect(simulateBusyDay().rowsRead).toBe(7188);
  });

  it("gives the same count every time", () => {
    expect(simulateBusyDay()).toEqual(simulateBusyDay());
  });
});
