import { expect, test } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { handOf } from "./handOf";
import { hiddenCardsSentToOthers } from "./hiddenCardsSentToOthers";
import { LONGEST_NAMES } from "./LONGEST_NAMES";
import { startFourPlayerGame } from "./startFourPlayerGame";

test("the hand, the big card, sell mode and the done state fit and are found by name", async ({
  browser,
  viewport,
}, testInfo) => {
  const players = await startFourPlayerGame(browser, viewport ?? { width: 1920, height: 1080 });
  const host = players[0]?.page;
  if (host === undefined) {
    throw new Error("no host");
  }
  const hand = host.getByRole("list", { name: "Your hand" });
  const [card = ""] = await handOf(host);

  await hand.getByRole("button", { name: card, exact: true }).click();
  const selected = host.getByRole("region", { name: `Selected card: ${card}` });
  await expect(selected.getByRole("heading", { name: /^Costs \d+ funds$/ })).toBeVisible();
  await expect(selected.getByRole("article", { name: card })).toBeVisible();
  await expectScreenFits(host, "card-selected", testInfo);
  await selected.getByRole("button", { name: "Close" }).click();

  await host.getByRole("button", { name: "Sell cards" }).click();
  await hand.getByRole("button", { name: card, exact: true }).click();
  await expect(host.getByRole("button", { name: "Sell 1 card" })).toBeVisible();
  await expect(host.getByText(/then Sell 1 card for 1 fund\./)).toBeVisible();
  await expectScreenFits(host, "sell-mode", testInfo);
  await hand.getByRole("button", { name: card, exact: true }).click();
  await host.getByRole("button", { name: "Cancel selling" }).click();

  await host.getByRole("button", { name: "End turn" }).click();
  const done = host.getByRole("status").filter({ hasText: "You are done for this turn" });
  for (const name of LONGEST_NAMES.slice(1)) {
    await expect(done).toContainText(name);
  }
  await expectScreenFits(host, "you-are-done", testInfo);
  expect(await hiddenCardsSentToOthers(players)).toEqual([]);
  await Promise.all(players.map(async (player) => player.page.context().close()));
});
