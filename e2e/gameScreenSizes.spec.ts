import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type ViewportSize } from "@playwright/test";
import { handOf } from "./handOf";
import type { Player } from "./Player";
import { signedInPlayer } from "./signedInPlayer";

const MINIMUM_TARGET_PX = 24;
const LONGEST_NAMES = ["Busy Harbour Mayor", "Quiet River Baron", "Grand Canal Trader", "Ann"];
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

async function startFourPlayerGame(
  browser: Parameters<typeof signedInPlayer>[0],
  viewport: ViewportSize,
): Promise<ReadonlyArray<Player>> {
  const players = await Promise.all(
    LONGEST_NAMES.map((name) => signedInPlayer(browser, name, viewport)),
  );
  const [host, ...guests] = players;
  if (host === undefined) {
    throw new Error("no players");
  }
  await host.page.getByLabel("Players").selectOption("4");
  await host.page.getByRole("button", { name: "Create room" }).click();
  await expect(host.page.getByRole("heading", { name: "Waiting for players" })).toBeVisible();
  const code = (await host.page.getByLabel("Room code").textContent()) ?? "";
  for (const guest of guests) {
    await guest.page.getByLabel("Room code").fill(code);
    await guest.page.getByRole("button", { name: "Join room" }).click();
  }
  for (const player of players) {
    await expect(player.page.getByRole("heading", { name: "Turn 1 of 40" })).toBeVisible();
  }
  return players;
}

async function targetsSmallerThanMinimum(page: Page): Promise<ReadonlyArray<string>> {
  return page.evaluate((minimum) => {
    const targets = document.querySelectorAll("button, a, input, select, [role=tab]");
    return [...targets]
      .map((target) => ({ name: target.textContent, box: target.getBoundingClientRect() }))
      .filter(({ box }) => box.width > 0 && (box.width < minimum || box.height < minimum))
      .map(({ name, box }) => `${name} ${String(box.width)}x${String(box.height)}`);
  }, MINIMUM_TARGET_PX);
}

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

async function hiddenCardsSentToOthers(
  players: ReadonlyArray<Player>,
): Promise<ReadonlyArray<string>> {
  const hands = await Promise.all(players.map(async (player) => handOf(player.page)));
  return players.flatMap((receiver, receiverIndex) =>
    hands
      .filter((ownerHand, ownerIndex) => ownerHand.length > 0 && ownerIndex !== receiverIndex)
      .flat()
      .filter((card) => receiver.frames.some((frame) => frame.includes(`"${card}"`))),
  );
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
  await host.screenshot({
    path: `harness/screens/gameScreenSizes/game-${testInfo.project.name}.png`,
  });
  expect(await host.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(
    false,
  );
  expect(await targetsSmallerThanMinimum(host)).toEqual([]);
  expect(await new AxeBuilder({ page: host }).analyze()).toHaveProperty("violations", []);
  expect(await hiddenCardsSentToOthers(players)).toEqual([]);
  await Promise.all(players.map(async (player) => player.page.context().close()));
});
