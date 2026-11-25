import { expect, test } from "@playwright/test";
import { percentileOf } from "../tools/harness-runner/percentileOf";
import { budgetLimitOf } from "./budgetLimitOf";
import { playFullGame } from "./playFullGame";

const GAMES = [
  {
    title: "two players play a whole game from the lobby to the end screen",
    bases: ["Ann", "Bea"],
    keyboardOnlyBases: ["Ann"],
  },
  {
    title: "three players play a whole game from the lobby to the end screen",
    bases: ["Ann", "Bea", "Cyd"],
    keyboardOnlyBases: [],
  },
  {
    title: "four players play a whole game from the lobby to the end screen",
    bases: ["Ann", "Bea", "Cyd", "Dee"],
    keyboardOnlyBases: [],
  },
];
const TURNS = 40;
const B15_PERCENTILE = 0.95;

for (const { title, bases, keyboardOnlyBases } of GAMES) {
  test(title, async ({ browser, viewport }, testInfo) => {
    const times = await playFullGame(
      browser,
      viewport ?? { width: 1920, height: 1080 },
      bases,
      keyboardOnlyBases,
      testInfo,
    );
    expect(times).toHaveLength(bases.length * (2 * TURNS - 1));
    const slowest = percentileOf(times, B15_PERCENTILE);
    testInfo.annotations.push({
      type: "B15",
      description: `95th percentile from a move to the updated view: ${String(Math.round(slowest))} ms over ${String(times.length)} moves`,
    });
    expect(slowest).toBeLessThanOrEqual(budgetLimitOf("B15"));
  });
}
