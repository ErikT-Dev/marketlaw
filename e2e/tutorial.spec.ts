import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { becomeGuest } from "./becomeGuest";
import { HUMAN_CHECK_MS } from "./HUMAN_CHECK_MS";
import { expectScreenFits } from "./expectScreenFits";
import { openLobby } from "./openLobby";

const TUTORIAL_TEST_MS = 180_000;

async function expectStep(page: Page, step: number): Promise<void> {
  await expect(page.getByRole("heading", { name: `Step ${String(step)} of 19` })).toBeVisible();
}

async function pressInTextBox(page: Page, step: number, button: string): Promise<void> {
  await expectStep(page, step);
  await page.getByRole("button", { name: button, exact: true }).click();
}

async function playHandCard(page: Page, step: number, card: string): Promise<void> {
  await expectStep(page, step);
  await page.getByRole("list", { name: "Your hand" }).getByRole("button", { name: card }).click();
  await page
    .getByRole("group", { name: "Actions" })
    .getByRole("button", { name: "Play card" })
    .click();
}

async function endTurn(page: Page, step: number): Promise<void> {
  await expectStep(page, step);
  await page.getByRole("button", { name: "End turn" }).click();
}

async function takeFromMarketplace(page: Page, step: number, card: string): Promise<void> {
  await expectStep(page, step);
  const marketplace = page.getByRole("list", { name: "Marketplace places" });
  await marketplace.getByRole("button", { name: card, exact: true }).click();
  await marketplace.getByRole("button", { name: "Draw", exact: true }).click();
}

async function drawSector(page: Page, step: number, sector: string): Promise<void> {
  await expectStep(page, step);
  await page.getByRole("button", { name: sector, exact: true }).click();
}

async function playTurnOne(page: Page, testInfo: TestInfo): Promise<void> {
  await pressInTextBox(page, 1, "Continue");
  await playHandCard(page, 2, "Row House");
  await expectStep(page, 3);
  await page.getByRole("button", { name: "End turn" }).click();
  const notThisStep = page.getByRole("status").filter({ hasText: "Not this step" });
  await expect(notThisStep).toContainText(
    "The tutorial is waiting for you to sell Hiking Trail. Nothing changed.",
  );
  await expectScreenFits(page, "tutorial-not-this-step", testInfo);
  await page.getByRole("button", { name: "Close: Not this step" }).click();
  await page.getByRole("button", { name: "Sell cards" }).click();
  await page
    .getByRole("list", { name: "Your hand" })
    .getByRole("button", { name: "Hiking Trail" })
    .click();
  await page.getByRole("button", { name: "Sell 1 card" }).click();
  await endTurn(page, 4);
}

async function playTurnsTwoToFour(page: Page): Promise<void> {
  await pressInTextBox(page, 5, "Continue");
  await takeFromMarketplace(page, 6, "Fire Station");
  await playHandCard(page, 7, "Fire Station");
  await expectStep(page, 8);
  await page.getByRole("button", { name: /^Claim all/ }).click();
  await page
    .getByRole("dialog", { name: "Claim all combos" })
    .getByRole("button", { name: "Claim all" })
    .click();
  await endTurn(page, 9);
  await drawSector(page, 10, "Public");
  await playHandCard(page, 11, "Public Playground");
  await endTurn(page, 12);
  await takeFromMarketplace(page, 13, "Orchard");
  await playHandCard(page, 14, "Orchard");
  await endTurn(page, 15);
}

async function playTurnFive(page: Page): Promise<void> {
  await drawSector(page, 16, "Service");
  await playHandCard(page, 17, "Liquor Shop");
  await expectStep(page, 18);
  await page
    .getByRole("region", { name: "Trading post" })
    .getByRole("button", { name: "Complete" })
    .click();
  await pressInTextBox(page, 19, "Finish");
}

test("a new visitor starts the tutorial from the lobby menu, plays all its steps and finishes", async ({
  browser,
  viewport,
}, testInfo) => {
  test.setTimeout(TUTORIAL_TEST_MS);
  const visitor = await openLobby(browser, "Tutor Ann", viewport ?? undefined);
  const { page } = visitor;
  await page.getByRole("button", { name: "Game menu", exact: true }).click();
  await page
    .getByRole("list", { name: "Game menu" })
    .getByRole("button", { name: "Tutorial" })
    .click();
  await becomeGuest(visitor);
  await expect(page.getByRole("heading", { name: "Tutorial · turn 1" })).toBeVisible({
    timeout: HUMAN_CHECK_MS,
  });
  await expectStep(page, 1);
  await expectScreenFits(page, "tutorial", testInfo);

  await playTurnOne(page, testInfo);
  await playTurnsTwoToFour(page);
  await playTurnFive(page);

  const complete = page.getByRole("dialog", { name: "Tutorial complete" });
  await expect(complete).toContainText(
    "You played your first turns, got your first income and completed your first quest.",
  );
  await expectScreenFits(page, "tutorial-complete", testInfo);
  await complete.getByRole("button", { name: "Go to the lobby" }).click();
  await expect(page.getByRole("button", { name: "Create room" })).toBeVisible();
});
