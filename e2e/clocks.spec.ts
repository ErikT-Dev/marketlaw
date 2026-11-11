import { expect, test, type Browser, type Page } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { startTestRoom } from "./startTestRoom";

const FREE_TIME_MS = 75_000;

async function seatPage(browser: Browser, link: string): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await page.goto(link);
  await expect(page.getByRole("heading", { name: "Turn 1 of 40" })).toBeVisible();
  return page;
}

test("clocks count down, and a player out of time in a casual game keeps playing", async ({
  browser,
  request,
}, testInfo) => {
  test.setTimeout(FREE_TIME_MS + 60_000);
  const [seatOne = "", seatTwo = ""] = await startTestRoom(request, {
    players: 2,
    seats: [{ seat: 1, time_bank_ms: 0 }],
  });
  const one = await seatPage(browser, seatOne);
  const two = await seatPage(browser, seatTwo);
  const bar = one.getByRole("banner");
  await expect(bar.getByRole("timer", { name: /^Time left 1:1\d$/ })).toBeVisible();
  await expect(bar.getByRole("timer", { name: "Bank 0:00" })).toBeVisible();
  await expect(
    two.getByRole("article", { name: "Seat 1" }).getByRole("timer", { name: "Bank 0:00" }),
  ).toBeVisible();
  await expectScreenFits(one, "game-clocks", testInfo);

  const toast = one.getByRole("status").filter({ hasText: "Your time ran out" });
  await expect(toast).toBeVisible({ timeout: FREE_TIME_MS + 15_000 });
  await expect(toast).toContainText("You can keep playing until the other players are done.");
  await expect(toast).not.toContainText("of 3");
  await expect(one.getByText("You are done for this turn", { exact: false })).toHaveCount(0);
  await expect(
    two
      .getByRole("list", { name: "Player order" })
      .getByRole("listitem")
      .filter({ hasText: "Seat 1" }),
  ).not.toContainText("done");
  await expectScreenFits(one, "game-out-of-time", testInfo);
});
