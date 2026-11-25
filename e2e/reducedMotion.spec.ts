import {
  expect,
  test,
  type APIRequestContext,
  type Browser,
  type Page,
  type ViewportSize,
} from "@playwright/test";
import { FULL_MARKETPLACE } from "./FULL_MARKETPLACE";
import { startTestRoom } from "./startTestRoom";

type Motion = "reduce" | "no-preference";

async function pageWithMotion(
  browser: Browser,
  reducedMotion: Motion,
  viewport: ViewportSize | null,
): Promise<Page> {
  const context = await browser.newContext(
    viewport === null ? { reducedMotion } : { reducedMotion, viewport },
  );
  return context.newPage();
}

async function runningAnimationCount(page: Page): Promise<number> {
  return page.evaluate(() => document.getAnimations().length);
}

async function scrollBehavior(page: Page): Promise<string> {
  return page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
}

async function openMarketFinalSeconds(page: Page, link: string) {
  await page.clock.install();
  await page.goto(link);
  await expect(page.getByRole("timer", { name: /^Your market go 0:[23]\d left$/ })).toBeVisible();
  await page.clock.fastForward(26_000);
  await expect(page.getByRole("timer", { name: /^Your market go 0:0[1-5] left$/ })).toBeVisible();
}

async function marketFinalSecondsLink(request: APIRequestContext): Promise<string> {
  const [seatOne = ""] = await startTestRoom(request, {
    players: 2,
    turn: 2,
    phase: "market",
    first_player: 1,
    market_go: { seat: 1 },
    marketplace: FULL_MARKETPLACE,
  });
  return seatOne;
}

test("with reduced motion the lobby does not animate when buttons are hovered and pressed", async ({
  browser,
  viewport,
}) => {
  const page = await pageWithMotion(browser, "reduce", viewport);
  await page.goto("/");
  const createRoom = page.getByRole("button", { name: "Create room" });
  await expect(createRoom).toBeVisible();
  await createRoom.hover();
  expect(await runningAnimationCount(page)).toBe(0);
  await createRoom.focus();
  expect(await runningAnimationCount(page)).toBe(0);
  expect(await scrollBehavior(page)).toBe("auto");
});

test("with reduced motion the game screen does not animate, not even the market countdown", async ({
  browser,
  request,
  viewport,
}) => {
  const page = await pageWithMotion(browser, "reduce", viewport);
  await openMarketFinalSeconds(page, await marketFinalSecondsLink(request));
  expect(await runningAnimationCount(page)).toBe(0);
  const marketplace = page.getByRole("list", { name: "Marketplace places" });
  await marketplace.getByRole("button", { name: "Dentist" }).hover();
  await page.getByRole("button", { name: "Menu", exact: true }).hover();
  expect(await runningAnimationCount(page)).toBe(0);
  expect(await scrollBehavior(page)).toBe("auto");
});

test("without reduced motion the market countdown pulses in its last seconds", async ({
  browser,
  request,
  viewport,
}) => {
  const page = await pageWithMotion(browser, "no-preference", viewport);
  await openMarketFinalSeconds(page, await marketFinalSecondsLink(request));
  expect(await runningAnimationCount(page)).toBeGreaterThan(0);
});
