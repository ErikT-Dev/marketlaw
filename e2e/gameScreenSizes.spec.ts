import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Browser, type Page, type ViewportSize } from "@playwright/test";

const MINIMUM_TARGET_PX = 24;
const LONGEST_NAMES = ["Busy Harbour Mayor", "Quiet River Baron", "Grand Canal Trader", "Ann"];

async function signedInPage(browser: Browser, name: string, viewport: ViewportSize): Promise<Page> {
  const page = await (await browser.newContext({ viewport })).newPage();
  await page.goto("/");
  await page.getByLabel("Your name").fill(name);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: `Hello, ${name}` })).toBeVisible();
  return page;
}

async function startFourPlayerGame(browser: Browser, viewport: ViewportSize): Promise<Page> {
  const [hostName = "", ...guestNames] = LONGEST_NAMES;
  const host = await signedInPage(browser, hostName, viewport);
  await host.getByLabel("Players").selectOption("4");
  await host.getByRole("button", { name: "Create room" }).click();
  await expect(host.getByRole("heading", { name: "Waiting for players" })).toBeVisible();
  const code = (await host.getByLabel("Room code").textContent()) ?? "";
  for (const name of guestNames) {
    const guest = await signedInPage(browser, name, viewport);
    await guest.getByLabel("Room code").fill(code);
    await guest.getByRole("button", { name: "Join room" }).click();
  }
  await expect(host.getByRole("heading", { name: "Turn 1 of 40" })).toBeVisible();
  return host;
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

test("the game screen fits the window with large enough targets and no accessibility problems", async ({
  browser,
  viewport,
}, testInfo) => {
  const host = await startFourPlayerGame(browser, viewport ?? { width: 1920, height: 1080 });
  await host.screenshot({
    path: `harness/screens/gameScreenSizes/game-${testInfo.project.name}.png`,
  });
  expect(await host.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(
    false,
  );
  expect(await targetsSmallerThanMinimum(host)).toEqual([]);
  expect(await new AxeBuilder({ page: host }).analyze()).toHaveProperty("violations", []);
});
