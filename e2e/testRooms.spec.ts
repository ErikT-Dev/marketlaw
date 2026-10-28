import { expect, test, type Browser, type ViewportSize } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { startTestRoom, TEST_ROOM_SECRET_HEADER } from "./startTestRoom";

async function openSeat(browser: Browser, viewport: ViewportSize | null, link: string) {
  const context = await browser.newContext({ viewport: viewport ?? { width: 1920, height: 1080 } });
  const page = await context.newPage();
  await page.goto(link);
  await expect(page.getByRole("heading", { name: /^Turn \d+ of 40$/ })).toBeVisible();
  return page;
}

test("the test room endpoint answers 404 without the right secret", async ({ request }) => {
  expect((await request.post("/api/test-rooms", { data: {} })).status()).toBe(404);
  const wrong = await request.post("/api/test-rooms", {
    headers: { [TEST_ROOM_SECRET_HEADER]: "not-the-secret-of-this-server" },
    data: {},
  });
  expect(wrong.status()).toBe(404);
});

test("income happens by itself in a test room and shows in the draw log", async ({
  browser,
  viewport,
  request,
}, testInfo) => {
  const [seatOne = ""] = await startTestRoom(request, {
    players: 2,
    seats: [{ seat: 1, stats: { workforce: 1, quality: 1, product: 1 }, hand: ["Liquor Shop"] }],
  });
  const page = await openSeat(browser, viewport, seatOne);
  await page
    .getByRole("list", { name: "Your hand" })
    .getByRole("button", { name: "Liquor Shop" })
    .click();
  await page
    .getByRole("region", { name: "Selected card: Liquor Shop" })
    .getByRole("button", { name: "Play card" })
    .click();
  await expect(
    page.getByRole("list", { name: "Draw log entries" }).getByRole("listitem"),
  ).toHaveText([/Turn 1: Seat 1 drew 1 card: \w+, tier 1 \(income\)$/]);
  await expect(page.getByRole("img", { name: "Income 4" })).toBeVisible();
  await expectScreenFits(page, "income-draw", testInfo);
  await page.context().close();
});

test("at the action limit only End turn is left and the action area says why", async ({
  browser,
  viewport,
  request,
}, testInfo) => {
  const [seatOne = ""] = await startTestRoom(request, {
    players: 2,
    seats: [{ seat: 1, actions_this_turn: 50, hand: ["Farm House"] }],
  });
  const page = await openSeat(browser, viewport, seatOne);
  const actions = page.getByRole("region", { name: "Actions" });
  await expect(actions).toContainText(
    "You have used all 50 actions this turn. You can still end your turn.",
  );
  await expect(actions.getByRole("button", { name: "Sell cards" })).toBeDisabled();
  await expect(actions.getByRole("button", { name: "End turn" })).toBeEnabled();
  await page
    .getByRole("list", { name: "Your hand" })
    .getByRole("button", { name: "Farm House" })
    .click();
  await expect(
    page.getByRole("region", { name: "Selected card: Farm House" }).getByRole("button", {
      name: "Play card",
    }),
  ).toBeDisabled();
  await expectScreenFits(page, "action-limit-reached", testInfo);
  await page.context().close();
});
