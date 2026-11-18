import { expect, test, type Page } from "@playwright/test";
import { createRoomAs } from "./createRoomAs";
import { expectScreenFits } from "./expectScreenFits";
import { openLobby } from "./openLobby";
import { startTestRoom } from "./startTestRoom";

const UNAVAILABLE_TUTORIAL = "Not available while you are in a game, a room or the ranked queue";

async function openGameMenu(page: Page, buttonName: string) {
  await page.getByRole("button", { name: buttonName, exact: true }).click();
  const menu = page.getByRole("list", { name: "Game menu" });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("button")).toHaveCount(3);
  return menu;
}

test("a visitor opens the rules and the card set from the game menu in the lobby", async ({
  browser,
  viewport,
}, testInfo) => {
  const visitor = await openLobby(browser, "Menu Ann", viewport ?? undefined);
  const menu = await openGameMenu(visitor.page, "Game menu");
  await expect(
    menu.getByRole("button", { name: "Rules", description: "How to play, with examples" }),
  ).toBeVisible();
  await expect(
    menu.getByRole("button", {
      name: "Tutorial",
      description: "A guided one-player game that teaches the first turns",
    }),
  ).toBeEnabled();
  await expectScreenFits(visitor.page, "game-menu-lobby", testInfo);

  await menu.getByRole("button", { name: "Rules" }).click();
  const rules = visitor.page.getByRole("dialog", { name: "Rules" });
  await expect(rules).toBeVisible();
  await visitor.page.keyboard.press("Escape");
  await expect(rules).toBeHidden();

  await openGameMenu(visitor.page, "Game menu");
  await visitor.page.keyboard.press("Escape");
  await expect(visitor.page.getByRole("list", { name: "Game menu" })).toBeHidden();
  await (
    await openGameMenu(visitor.page, "Game menu")
  )
    .getByRole("button", { name: "Card set" })
    .click();
  await expect(visitor.page.getByRole("dialog", { name: "Card set" })).toBeVisible();
});

test("the game menu in a waiting room offers the rules and the card set but not the tutorial", async ({
  browser,
  viewport,
}) => {
  const owner = await openLobby(browser, "Menu Bea", viewport ?? undefined);
  await createRoomAs(owner, 3);
  const menu = await openGameMenu(owner.page, "Game menu");
  await expect(
    menu.getByRole("button", { name: "Card set", description: /with filters and search/ }),
  ).toBeVisible();
  await expect(
    menu.getByRole("button", { name: "Tutorial", description: UNAVAILABLE_TUTORIAL }),
  ).toBeDisabled();
  await menu.getByRole("button", { name: "Rules" }).click();
  await expect(owner.page.getByRole("dialog", { name: "Rules" })).toBeVisible();
});

test("the menu during a game says the clock keeps running and opens the pages below the top bar", async ({
  browser,
  request,
  viewport,
}, testInfo) => {
  const [seatOne = ""] = await startTestRoom(request, { players: 2 });
  const context = await browser.newContext(viewport === null ? {} : { viewport });
  const page = await context.newPage();
  await page.goto(seatOne);
  const turn = page.getByRole("heading", { name: "Turn 1 of 40" });
  await expect(turn).toBeVisible();

  const menu = await openGameMenu(page, "Menu");
  await expect(
    menu.getByRole("button", {
      name: "Rules",
      description: "Your clock keeps running while you read",
    }),
  ).toBeVisible();
  await expect(
    menu.getByRole("button", { name: "Tutorial", description: UNAVAILABLE_TUTORIAL }),
  ).toBeDisabled();
  await expectScreenFits(page, "game-menu-game", testInfo);

  await menu.getByRole("button", { name: "Rules" }).click();
  const rules = page.getByRole("dialog", { name: "Rules" });
  await expect(rules).toBeVisible();
  await expect(turn).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(rules).toBeHidden();

  await (await openGameMenu(page, "Menu")).getByRole("button", { name: "Card set" }).click();
  const cardSet = page.getByRole("dialog", { name: "Card set" });
  await expect(cardSet).toBeVisible();
  await expect(cardSet.getByRole("note")).toContainText(
    "Your clock keeps running while the card set is open.",
  );
});
