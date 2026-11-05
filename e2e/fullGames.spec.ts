import { expect, test } from "@playwright/test";
import { budgetLimitOf } from "./budgetLimitOf";
import { percentile95 } from "./percentile95";
import { playFullGame } from "./playFullGame";

const GAMES = [
  {
    title: "two players play a whole game from the lobby to the end screen",
    bases: ["Ann", "Bea"],
  },
  {
    title: "three players play a whole game from the lobby to the end screen",
    bases: ["Ann", "Bea", "Cyd"],
  },
  {
    title: "four players play a whole game from the lobby to the end screen",
    bases: ["Ann", "Bea", "Cyd", "Dee"],
  },
];
const TURNS = 40;

for (const { title, bases } of GAMES) {
  test(title, async ({ browser, viewport }, testInfo) => {
    const times = await playFullGame(
      browser,
      viewport ?? { width: 1920, height: 1080 },
      bases,
      testInfo,
    );
    expect(times).toHaveLength(bases.length * (2 * TURNS - 1));
    const slowest = percentile95(times);
    testInfo.annotations.push({
      type: "B15",
      description: `95th percentile from a move to the updated view: ${String(Math.round(slowest))} ms over ${String(times.length)} moves`,
    });
    expect(slowest).toBeLessThanOrEqual(budgetLimitOf("B15"));
  });
}
