import { expect, test, type Page } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { cardsHeldOnce } from "./cardsHeldOnce";
import { hiddenCardsSentToOthers } from "./hiddenCardsSentToOthers";
import { startFourPlayerGame } from "./startFourPlayerGame";

function hostCardSeenBy(page: Page, host: string) {
  return page
    .getByRole("region", { name: "Opponents" })
    .getByRole("article", { name: `Quick summary table of ${host}` });
}

async function sellOneCard(page: Page): Promise<void> {
  const [card = ""] = await cardsHeldOnce(page);
  await page.getByRole("button", { name: "Sell cards" }).click();
  await page
    .getByRole("list", { name: "Your hand" })
    .getByRole("button", { name: card, exact: true })
    .click();
  await page.getByRole("button", { name: "Sell 1 card" }).click();
  await expect(page.getByRole("button", { name: "Sell cards" })).toBeEnabled();
}

test("others see a player as at the start of the main phase until it ends, with a live done mark", async ({
  browser,
  viewport,
}, testInfo) => {
  const players = await startFourPlayerGame(browser, viewport ?? { width: 1920, height: 1080 });
  const [host, watcher, ...rest] = players;
  if (host === undefined || watcher === undefined) {
    throw new Error("no players");
  }
  await sellOneCard(host.page);
  await host.page.getByRole("button", { name: "End turn" }).click();
  const seen = hostCardSeenBy(watcher.page, host.name);
  await expect(seen).toContainText("done");
  await expect(seen).toContainText("Hand 7");

  await seen.getByRole("button", { name: `Detailed summary table of ${host.name}` }).click();
  const board = watcher.page.getByRole("dialog", {
    name: `Detailed summary table of ${host.name}`,
  });
  await expect(board).toContainText("Their hand: 7 cards.");
  await expect(board).toContainText("This turn: done this turn");
  await expectScreenFits(watcher.page, "opponent-board", testInfo);
  await board.getByRole("button", { name: "Close" }).click();

  for (const player of [watcher, ...rest]) {
    await player.page.getByRole("button", { name: "End turn" }).click();
  }
  await expect(watcher.page.getByRole("heading", { name: "Turn 2 of 40" })).toBeVisible();
  await expect(hostCardSeenBy(watcher.page, host.name)).toContainText("Hand 6");
  expect(await hiddenCardsSentToOthers(players)).toEqual([]);
  await Promise.all(players.map(async (player) => player.page.context().close()));
});
