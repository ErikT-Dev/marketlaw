import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { handOf } from "./handOf";
import { signedInPlayer } from "./signedInPlayer";

async function sellFirstCardAndEndTurn(page: Page): Promise<string> {
  const [card = ""] = await handOf(page);
  const hand = page.getByRole("list", { name: "Your hand" });
  await page.getByRole("button", { name: "Sell cards" }).click();
  await hand.getByRole("button", { name: card, exact: true }).click();
  await page.getByRole("button", { name: "Sell 1 card" }).click();
  await expect(hand.getByRole("button", { name: card, exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "End turn" }).click();
  return card;
}

test("two players play turn 1 together and never see each other's hands", async ({
  browser,
  viewport,
}, testInfo) => {
  const size = viewport ?? { width: 1920, height: 1080 };
  const ann = await signedInPlayer(browser, "Ann", size);
  const bea = await signedInPlayer(browser, "Bea", size);
  await ann.page.getByRole("button", { name: "Create room" }).click();
  await expect(ann.page.getByRole("heading", { name: "Waiting for players" })).toBeVisible();
  const code = await ann.page.getByLabel("Room code").textContent();
  await bea.page.getByLabel("Room code").fill(code ?? "");
  await bea.page.getByRole("button", { name: "Join room" }).click();
  for (const player of [ann, bea]) {
    await expect(player.page.getByRole("heading", { name: "Turn 1" })).toBeVisible();
    expect(await new AxeBuilder({ page: player.page }).analyze()).toHaveProperty("violations", []);
  }
  const annStartingHand = await handOf(ann.page);
  const beaStartingHand = await handOf(bea.page);
  const annSold = await sellFirstCardAndEndTurn(ann.page);
  const annFramesBeforeTurnEnds = ann.frames.length;
  const beaSold = await sellFirstCardAndEndTurn(bea.page);
  for (const player of [ann, bea]) {
    await expect(player.page.getByRole("heading", { name: "Turn 2" })).toBeVisible();
  }
  const annHand = await handOf(ann.page);
  const beaHand = await handOf(bea.page);
  for (const card of beaHand) {
    expect(ann.frames.some((frame) => frame.includes(`"${card}"`))).toBe(false);
  }
  for (const card of beaStartingHand) {
    const framesInTurnOne = ann.frames.slice(0, annFramesBeforeTurnEnds);
    expect(framesInTurnOne.some((frame) => frame.includes(`"${card}"`))).toBe(false);
  }
  expect(annStartingHand.length).toBeGreaterThan(0);
  for (const card of annHand) {
    expect(bea.frames.some((frame) => frame.includes(`"${card}"`))).toBe(false);
  }
  const marketplace = ann.page.getByRole("region", { name: "Marketplace" });
  await expect(marketplace.getByText(/^Deck \d+$/)).toBeVisible();
  await marketplace.getByRole("button", { name: /^Discard \d+ · view ›$/ }).click();
  const discard = ann.page.getByRole("dialog", { name: /^Discard pile/ });
  await expect(discard).toContainText(annSold);
  await expect(discard).toContainText(beaSold);
  await expectScreenFits(ann.page, "discard-pile", testInfo);
  await discard.getByRole("button", { name: "Close" }).click();
  await ann.page.reload();
  await expect(ann.page.getByRole("heading", { name: "Turn 2" })).toBeVisible();
});
