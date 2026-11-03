import { describe, expect, it } from "vitest";
import { busyDayTotal } from "./busyDayTotal.ts";
import { simulateBusyDay } from "./simulateBusyDay.ts";

describe("the busy-day simulator", () => {
  it("counts the rows a day of 50 rooms writes outside its games, each kind above zero", () => {
    const rows = simulateBusyDay();
    expect(rows.room).toBeGreaterThan(0);
    expect(rows.alarm).toBeGreaterThan(0);
    expect(rows.lobby).toBeGreaterThan(0);
    expect(rows.database).toBe(150);
    expect(busyDayTotal(rows)).toBe(rows.room + rows.alarm + rows.lobby + rows.database);
    expect(simulateBusyDay()).toEqual(rows);
  });
});
