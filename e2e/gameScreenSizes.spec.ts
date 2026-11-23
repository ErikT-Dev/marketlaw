import { expect, test, type Page } from "@playwright/test";
import { expectAllProjectsInView } from "./expectAllProjectsInView";
import { expectScreenFits } from "./expectScreenFits";
import { hiddenCardsSentToOthers } from "./hiddenCardsSentToOthers";
import { startFourPlayerGame } from "./startFourPlayerGame";

const TABLE_PANELS = [
  "Opponents",
  "Game log and chat",
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
  "Build passes",
  "Influence",
];
const STATS_IN_TENTHS = ["Funds", "Income"];

function statValuePattern(stat: string): RegExp {
  return new RegExp(`^${stat} ${STATS_IN_TENTHS.includes(stat) ? "\\d+\\.\\d" : "-?\\d+"}$`);
}

async function expectTableElements(page: Page, names: ReadonlyArray<string>): Promise<void> {
  const order = page.getByRole("list", { name: "Player order" });
  for (const name of names) {
    await expect(order.getByRole("listitem").filter({ hasText: name })).toBeVisible();
  }
  await expect(order.getByText("first player")).toBeVisible();
  for (const panel of TABLE_PANELS) {
    await expect(page.getByRole("region", { name: panel })).toBeVisible();
  }
  await expect(page.getByRole("tabpanel", { name: "Game log" })).toContainText(
    "No cards drawn yet.",
  );
  await expect(
    page.getByRole("region", { name: "Marketplace" }).getByText(/^Deck \d+$/),
  ).toBeVisible();
  const stats = page.getByRole("region", { name: "Your stats" });
  for (const stat of STAT_NAMES) {
    await expect(stats.getByRole("img", { name: statValuePattern(stat) })).toBeVisible();
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
  await expectTableElements(
    host,
    players.map(({ name }) => name),
  );
  await expectScreenFits(host, "game-table", testInfo);
  await expectAllProjectsInView(host);
  expect(await hiddenCardsSentToOthers(players)).toEqual([]);
  await Promise.all(players.map(async (player) => player.page.context().close()));
});
