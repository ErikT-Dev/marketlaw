import { describe, expect, it } from "vitest";
import { busyDayTotal } from "./busyDayTotal.ts";
import { simulateBusyDay } from "./simulateBusyDay.ts";

describe("the busy-day simulator", () => {
  it("counts the exact rows a day of 50 rooms writes outside its games", () => {
    const rows = simulateBusyDay();
    expect(rows).toEqual({ room: 498, alarm: 398, lobby: 498, database: 450 });
    expect(busyDayTotal(rows)).toBe(1844);
  });

  it("gives the same count every time", () => {
    expect(simulateBusyDay()).toEqual(simulateBusyDay());
  });
});
