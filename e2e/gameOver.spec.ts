import { expect, test, type Browser, type Page } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { startTestRoom } from "./startTestRoom";

async function seatPage(browser: Browser, link: string): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await page.goto(link);
  await expect(page.getByRole("heading", { name: "Turn 12 of 40" })).toBeVisible();
  return page;
}

test("a game played to the end goal shows the winner, the places and the scores", async ({
  browser,
  request,
}, testInfo) => {
  const [seatOne = "", seatTwo = ""] = await startTestRoom(request, {
    players: 2,
    turn: 12,
    seats: [
      { seat: 1, stats: { income: 200 }, projects: ["quality", "satisfaction", "workforce"] },
    ],
  });
  const one = await seatPage(browser, seatOne);
  const two = await seatPage(browser, seatTwo);
  for (const page of [one, two]) {
    await page.getByRole("button", { name: "End turn" }).click();
  }
  for (const page of [one, two]) {
    const dialog = page.getByRole("dialog", { name: "Seat 1 wins!" });
    await expect(dialog).toBeVisible();
    const why = dialog.getByText(/reached .* and all 3 projects in turn 12/);
    await expect(why.getByRole("img", { name: "Income 200" })).toBeVisible();
    await expect(dialog.getByRole("table", { name: "Places" }).getByRole("row")).toHaveCount(3);
  }
  await expectScreenFits(one, "game-over-end-goal", testInfo);
  await one.getByRole("button", { name: "Close" }).click();
  await expect(one.getByText("Game over · You won with")).toBeVisible();
  await one.getByRole("button", { name: "Show result" }).click();
  await expect(one.getByRole("dialog", { name: "Seat 1 wins!" })).toBeVisible();
  await two.getByRole("button", { name: "Exit to lobby" }).click();
  await expect(two.getByRole("button", { name: "Create room" })).toBeVisible();
});
