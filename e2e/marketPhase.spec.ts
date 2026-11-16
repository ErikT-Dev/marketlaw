import { expect, test, type Browser, type Page } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { handOf } from "./handOf";
import type { Player } from "./Player";
import { startTestRoom } from "./startTestRoom";

const FULL_MARKETPLACE = [
  { place: "residential", card: "Row House" },
  { place: "industry", card: "Metal Mining" },
  { place: "service", card: "Liquor Shop" },
  { place: "public_quality", card: "Fire Station" },
  { place: "public_satisfaction", card: "Public Playground" },
  { place: "open_1", card: "Dentist" },
  { place: "open_2", card: "Apparel Store" },
  { place: "open_3", card: "Forest Plantation" },
];

async function playerAt(browser: Browser, link: string): Promise<Player> {
  const page = await (await browser.newContext()).newPage();
  const frames: string[] = [];
  page.on("websocket", (socket) => {
    socket.on("framereceived", (frame) => {
      frames.push(String(frame.payload));
    });
  });
  await page.goto(link);
  await expect(page.getByRole("heading", { name: "Turn 2 of 40" })).toBeVisible();
  return { page, frames, name: "" };
}

async function expectMainPhase(page: Page) {
  await expect(page.getByText("Main phase", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play card" })).toBeVisible();
}

test("one player takes a marketplace card while the other waits, then both play the main phase", async ({
  browser,
  request,
  viewport,
}, testInfo) => {
  const [seatOne = "", seatTwo = ""] = await startTestRoom(request, {
    players: 2,
    turn: 2,
    phase: "market",
    marketplace: FULL_MARKETPLACE,
    seats: [
      { seat: 1, hand: ["Pub", "Cottage"] },
      { seat: 2, hand: ["Dorm"] },
    ],
  });
  const one = await playerAt(browser, seatOne);
  const two = await playerAt(browser, seatTwo);
  await Promise.all(
    [one.page, two.page].map(async (page) =>
      page.setViewportSize(viewport ?? { width: 1920, height: 1080 }),
    ),
  );

  await expect(
    two.page.getByRole("heading", { name: "Your go: choose your turn draw" }),
  ).toBeVisible();
  await expect(two.page.getByRole("button", { name: "Play card" })).toHaveCount(0);
  await expect(
    two.page.getByRole("banner").getByRole("timer", { name: /^Your go 0:[0-4]\d$/ }),
  ).toBeVisible();
  await expect(
    one.page.getByRole("banner").getByRole("timer", { name: /^Go: Seat 2 0:[0-4]\d$/ }),
  ).toBeVisible();
  await expectScreenFits(two.page, "market-your-turn-draw", testInfo);
  await expect(one.page.getByRole("heading", { name: "Seat 2's go" })).toBeVisible();
  await expectScreenFits(one.page, "market-before-your-go", testInfo);
  await expect(two.page.getByRole("region", { name: "MARKET PHASE" })).toContainText("Your go");
  await expect(one.page.getByRole("region", { name: "MARKET PHASE" })).toContainText("Seat 2's go");
  await expectScreenFits(one.page, "market-phase-banner", testInfo);
  await expectScreenFits(two.page, "market-phase-banner-your-go", testInfo);

  const twoMarketplace = two.page.getByRole("list", { name: "Marketplace places" });
  await twoMarketplace.getByRole("button", { name: "Row House" }).click();
  await expect(twoMarketplace.getByRole("button", { name: "Row House" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expectScreenFits(two.page, "market-card-selected", testInfo);
  await twoMarketplace.getByRole("button", { name: "Draw", exact: true }).click();
  await expectMainPhase(two.page);
  const twoHand = two.page.getByRole("list", { name: "Your hand" });
  await expect(twoHand.getByRole("button")).toHaveCount(3);
  await expect(twoHand.getByRole("button", { name: "Row House" })).toHaveAccessibleDescription(
    /new/,
  );
  await expect(
    two.page.getByRole("banner").getByRole("timer", { name: /^Go: Seat 1 / }),
  ).toBeVisible();
  await expectScreenFits(two.page, "market-you-had-your-go", testInfo);

  await expect(
    one.page.getByRole("heading", { name: "Your go: choose your turn draw" }),
  ).toBeVisible();
  await expect(
    one.page.getByRole("list", { name: "Marketplace places" }).getByText("Empty until next turn"),
  ).toHaveCount(1);
  await one.page.getByRole("button", { name: "Service" }).click();
  await expectMainPhase(one.page);
  await expectMainPhase(two.page);
  await expect(one.page.getByRole("region", { name: "MARKET PHASE" })).toHaveCount(0);
  await expect(one.page.getByRole("list", { name: "Your hand" }).getByRole("button")).toHaveCount(
    4,
  );
  await expect(
    one.page.getByText("Seat 2 took Row House from the marketplace", { exact: false }),
  ).toBeVisible();

  const twoDrawn = (await handOf(two.page)).filter((card) => !["Dorm", "Row House"].includes(card));
  const oneDrawn = (await handOf(one.page)).filter((card) => !["Pub", "Cottage"].includes(card));
  expect(twoDrawn).toHaveLength(1);
  expect(oneDrawn).toHaveLength(2);
  for (const card of twoDrawn) {
    expect(one.frames.some((frame) => frame.includes(`"${card}"`))).toBe(false);
  }
  for (const card of oneDrawn) {
    expect(two.frames.some((frame) => frame.includes(`"${card}"`))).toBe(false);
  }
});

test("a player whose go comes with an empty marketplace chooses a sector", async ({
  page,
  request,
}, testInfo) => {
  const [, seatTwo = ""] = await startTestRoom(request, {
    players: 2,
    turn: 2,
    phase: "market",
    marketplace: [],
  });
  await page.goto(seatTwo);
  await expect(page.getByRole("heading", { name: "The marketplace is empty" })).toBeVisible();
  await expectScreenFits(page, "market-marketplace-empty", testInfo);
  await page.getByRole("button", { name: "Industry" }).click();
  await expectMainPhase(page);
});

test("a player whose market go timed out chooses the sector of their turn draw in the main phase", async ({
  page,
  request,
}, testInfo) => {
  const [, seatTwo = ""] = await startTestRoom(request, {
    players: 2,
    turn: 2,
    phase: "market",
    marketplace: FULL_MARKETPLACE,
    seats: [
      { seat: 1, hand: ["Pub"] },
      { seat: 2, hand: ["Dorm"], market: "out", turn_draw_pending: true },
    ],
  });
  await page.goto(seatTwo);
  const openDraw = page.getByRole("group", { name: "Turn draw left open" });
  await expect(openDraw).toContainText(
    "Your time ran out on your market go. Choose a sector for your 2 cards.",
  );
  await expectMainPhase(page);
  await expect(page.getByRole("region", { name: "MARKET PHASE" })).toHaveCount(0);
  const marketplace = page.getByRole("list", { name: "Marketplace places" });
  await marketplace.getByRole("button", { name: "Dentist" }).click();
  await expect(marketplace.getByRole("button", { name: "Draw" })).toHaveCount(0);
  await page
    .getByRole("region", { name: "Selected card: Dentist" })
    .getByRole("button", { name: "Close" })
    .click();
  await expectScreenFits(page, "market-open-turn-draw", testInfo);
  await openDraw.getByRole("button", { name: "Residential" }).click();
  await expect(openDraw).toHaveCount(0);
  await expect(page.getByRole("list", { name: "Your hand" }).getByRole("button")).toHaveCount(3);
});
