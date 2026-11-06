import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { cardsHeldOnce } from "./cardsHeldOnce";
import { handOf } from "./handOf";
import { startGame } from "./startGame";

async function sellFirstCardAndEndTurn(page: Page): Promise<string> {
  const [card = ""] = await cardsHeldOnce(page);
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
}) => {
  const size = viewport ?? { width: 1920, height: 1080 };
  const [ann, bea] = await startGame(browser, size, ["Ann", "Bea"]);
  if (ann === undefined || bea === undefined) {
    throw new Error("no players");
  }
  for (const player of [ann, bea]) {
    expect(await new AxeBuilder({ page: player.page }).analyze()).toHaveProperty("violations", []);
  }
  const annStartingHand = await handOf(ann.page);
  const beaStartingHand = await handOf(bea.page);
  await sellFirstCardAndEndTurn(ann.page);
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
  await expect(marketplace.getByText(/^Discard \d+$/)).toBeVisible();
  await expect(marketplace.getByRole("button", { name: /^Discard/ })).toHaveCount(0);
  expect(ann.frames.some((frame) => frame.includes(`"${beaSold}"`))).toBe(false);
  await ann.page.reload();
  await expect(ann.page.getByRole("heading", { name: "Turn 2" })).toBeVisible();
});
