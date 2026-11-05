import { describe, expect, it } from "vitest";
import { busyDayTotal } from "./busyDayTotal.ts";
import { simulateBusyDay } from "./simulateBusyDay.ts";

describe("the busy-day simulator", () => {
  it("counts the exact rows a day of 50 rooms writes outside its games", () => {
    const { written } = simulateBusyDay();
    expect(written).toEqual({ room: 597, alarm: 448, lobby: 631, database: 450 });
    expect(busyDayTotal(written)).toBe(2126);
  });

  it("counts the rows the rooms, the lobby and the token lookups read outside the games", () => {
    expect(simulateBusyDay().rowsRead).toBe(2788);
  });

  it("gives the same count every time", () => {
    expect(simulateBusyDay()).toEqual(simulateBusyDay());
  });
});
