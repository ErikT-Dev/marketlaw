import { describe, expect, it } from "vitest";
import { busyDayTotal } from "./busyDayTotal.ts";
import { simulateBusyDay } from "./simulateBusyDay.ts";

describe("the busy-day simulator", () => {
  it("counts the exact rows a day of 30 room games and 20 ranked games from the queue writes outside its games, the queue, the end of each room and the account actions included", () => {
    const { written } = simulateBusyDay();
    expect(written).toEqual({
      room: 530,
      alarm: 380,
      lobby: 792,
      queue: 262,
      database: 1830,
    });
    expect(busyDayTotal(written)).toBe(3794);
  });

  it("counts the rows the rooms, the lobby, the queue and the token lookups read outside the games", () => {
    expect(simulateBusyDay().rowsRead).toBe(7539);
  });

  it("gives the same count every time", () => {
    expect(simulateBusyDay()).toEqual(simulateBusyDay());
  });
});
