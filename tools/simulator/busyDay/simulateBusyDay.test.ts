import { describe, expect, it } from "vitest";
import { busyDayTotal } from "./busyDayTotal.ts";
import { simulateBusyDay } from "./simulateBusyDay.ts";

describe("the busy-day simulator", () => {
  it("counts the exact rows a day of 50 rooms writes outside its games", () => {
    const rows = simulateBusyDay();
    expect(rows).toEqual({ room: 597, alarm: 448, lobby: 631, database: 450 });
    expect(busyDayTotal(rows)).toBe(2126);
  });

  it("gives the same count every time", () => {
    expect(simulateBusyDay()).toEqual(simulateBusyDay());
  });
});
