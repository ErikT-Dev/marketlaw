import { expect, test, type Page } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { hiddenCardsSentToOthers } from "./hiddenCardsSentToOthers";
import { LONGEST_NAMES } from "./LONGEST_NAMES";
import { startFourPlayerGame } from "./startFourPlayerGame";

const TABLE_PANELS = [
  "Opponents",
  "Draw log",
  "Marketplace",
  "Quests",
  /^Your city/,
  "Combos",
  "Your stats",
  /^Your hand/,
  "Actions",
];
const STAT_NAMES = [
  "Funds",
  "Income",
  "Workforce",
  "Quality",
  "Satisfaction",
  "Product",
  "Distribution",
  "Bonus",
  "Build passes",
  "Influence",
];

async function expectTableElements(page: Page): Promise<void> {
  const order = page.getByRole("list", { name: "Player order" });
  for (const name of LONGEST_NAMES) {
    await expect(order.getByRole("listitem").filter({ hasText: name })).toBeVisible();
  }
  await expect(order.getByText("first player")).toBeVisible();
  for (const panel of TABLE_PANELS) {
    await expect(page.getByRole("region", { name: panel })).toBeVisible();
  }
  const stats = page.getByRole("region", { name: "Your stats" });
  for (const stat of STAT_NAMES) {
    await expect(stats.getByRole("img", { name: new RegExp(`^${stat} -?\\d+$`) })).toBeVisible();
  }
}

test("the game screen fits the window with large enough targets and no accessibility problems", async ({
  browser,
  viewport,
}, testInfo) => {
  const players = await startFourPlayerGame(browser, viewport ?? { width: 1920, height: 1080 });
  const host = players[0]?.page;
  if (host === undefined) {
    throw new Error("no host");
  }
  await expectTableElements(host);
  await expectScreenFits(host, "game-table", testInfo);
  expect(await hiddenCardsSentToOthers(players)).toEqual([]);
  await Promise.all(players.map(async (player) => player.page.context().close()));
});
