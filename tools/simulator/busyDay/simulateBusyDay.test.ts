import { describe, expect, it } from "vitest";
import { busyDayTotal } from "./busyDayTotal.ts";
import { simulateBusyDay } from "./simulateBusyDay.ts";

describe("the busy-day simulator", () => {
  it("counts the exact rows a day of 30 room games, 20 ranked games from the queue and 100 tutorials writes outside its games, the queue, the end of each room and the account actions included", () => {
    const { written } = simulateBusyDay();
    expect(written).toEqual({
      room: 630,
      alarm: 480,
      lobby: 992,
      queue: 262,
      database: 1830,
    });
    expect(busyDayTotal(written)).toBe(4194);
  });

  it("counts the rows the rooms, the lobby, the queue, the tutorials and the token lookups read outside the games", () => {
    expect(simulateBusyDay().rowsRead).toBe(8039);
  });

  it("gives the same count every time", () => {
    expect(simulateBusyDay()).toEqual(simulateBusyDay());
  });
});
