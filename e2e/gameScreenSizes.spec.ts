import { expect, test, type Page } from "@playwright/test";
import { expectAllProjectsInView } from "./expectAllProjectsInView";
import { expectScreenFits } from "./expectScreenFits";
import { hiddenCardsSentToOthers } from "./hiddenCardsSentToOthers";
import { openTestSeat } from "./openTestSeat";
import { startFourPlayerGame } from "./startFourPlayerGame";
import { startTestRoom } from "./startTestRoom";

const TABLE_PANELS = [
  "Players",
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

function statValuePattern(stat: string): RegExp {
  return new RegExp(`^${stat} -?\\d+$`);
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

const EVERY_TYPE = [
  "Suburban Housing",
  "Low Wealth",
  "Town Housing",
  "Luxury",
  "City Housing",
  "Raw Material",
  "Forestry",
  "Farm",
  "Power Plant",
  "Mine",
  "Light Industry",
  "Food",
  "Sea",
  "Alcohol",
  "Grain",
  "Heavy Industry",
  "Petroleum",
  "High Tech",
  "Utility",
  "Mass Transit",
  "Service",
  "Leisure",
  "Retail",
  "Health",
  "Mercantile",
  "Beautification",
  "Culture",
  "Office",
  "Mass Media",
  "Safety",
  "Finance",
  "Rental Space",
  "Education",
];
const LATE_GAME_HAND = [
  "Farm House",
  "Single Family House",
  "Brick Cottage",
  "Garden Apartment",
  "Historic Apartment Housing",
  "Forest Plantation",
  "Intensive Corn Farm",
  "Fishing Industry",
  "Furniture Factory",
  "Pub",
  "Pharmacy",
  "Shoe Store",
  "Restaurant",
  "Investment Firm",
];

async function handAndCardHeights(page: Page) {
  const hand = page.getByRole("region", { name: /^Your hand · \d+ cards$/ });
  const handBox = await hand.boundingBox();
  const cardBox = await hand.getByRole("listitem").first().boundingBox();
  return { hand: handBox?.height ?? 0, card: cardBox?.height ?? Number.POSITIVE_INFINITY };
}

test("late in a game with every type, the hand keeps at least one card's height", async ({
  browser,
  request,
  viewport,
}) => {
  const [seatOne = ""] = await startTestRoom(request, {
    players: 2,
    turn: 35,
    phase: "main",
    seats: [
      {
        seat: 1,
        hand: LATE_GAME_HAND,
        gained_types: Object.fromEntries(EVERY_TYPE.map((type, index) => [type, 10 + index])),
      },
    ],
  });
  const page = await openTestSeat(browser, viewport, seatOne);
  await expect(
    page.getByRole("list", { name: "Your type counts, bonus types first" }).getByRole("listitem"),
  ).toHaveCount(EVERY_TYPE.length);
  const { hand, card } = await handAndCardHeights(page);
  expect(hand).toBeGreaterThanOrEqual(card);
  await page.context().close();
});
