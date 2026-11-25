import { expect, test, type Page } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { openLobby } from "./openLobby";
import { startTestRoom } from "./startTestRoom";

async function openPageByLink(page: Page, hash: string, title: string) {
  await page.evaluate((pageHash) => {
    window.location.hash = pageHash;
  }, hash);
  const opened = page.getByRole("dialog", { name: title });
  await expect(opened).toBeVisible();
  return opened;
}

async function openRulesByLink(page: Page, hash: string) {
  return openPageByLink(page, hash, "Rules");
}

test("a visitor reads the rules section by section and goes back to the lobby", async ({
  browser,
  viewport,
}, testInfo) => {
  const visitor = await openLobby(browser, "Rules Ann", viewport ?? undefined);
  const rules = await openRulesByLink(visitor.page, "#rules");
  const contents = rules.getByRole("navigation", { name: "Contents" });
  await expect(contents.getByRole("link")).toHaveCount(21);
  const section = rules.getByRole("article");
  await expect(section.getByRole("heading", { level: 2 })).toHaveText("The goal");
  await expectScreenFits(visitor.page, "rules-viewer", testInfo);

  await rules.getByRole("button", { name: "Next: Your stats" }).click();
  await expect(section.getByRole("heading", { level: 2 })).toHaveText("Your stats");
  await contents.getByRole("link", { name: "Time" }).click();
  await expect(section.getByRole("heading", { level: 2 })).toHaveText("Time");
  await section
    .getByRole("group", { name: "See also" })
    .getByRole("link", { name: "The marketplace" })
    .click();
  await expect(section.getByRole("heading", { level: 2 })).toHaveText("The marketplace");
  await contents.getByRole("link", { name: "Income" }).click();
  await expect(section.getByRole("heading", { level: 2 })).toHaveText("Income");
  await expect(section.getByRole("img", { name: "Income" }).first()).toBeVisible();

  await rules.getByRole("button", { name: "Back" }).click();
  await expect(rules).toBeHidden();
  await expect(visitor.page.getByRole("button", { name: "Create room" })).toBeVisible();
  await openRulesByLink(visitor.page, "#rules/income");
  await visitor.page.keyboard.press("Escape");
  await expect(visitor.page.getByRole("dialog", { name: "Rules" })).toBeHidden();
});

test("the rules opened during a game leave the top bar visible and repeat the time left", async ({
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

  const rules = await openRulesByLink(page, "#rules/time");
  await expect(turn).toBeVisible();
  const note = rules.getByRole("note");
  await expect(note).toContainText("Your clock keeps running while the rules are open.");
  await expect(note.getByRole("timer", { name: /^Time left \d+:\d\d$/ })).toBeVisible();
  await expectScreenFits(page, "rules-during-game", testInfo);

  await rules.getByRole("button", { name: "Back" }).click();
  await expect(rules).toBeHidden();
  await expect(page.getByRole("button", { name: "Leave game" })).toBeVisible();

  const cardSet = await openPageByLink(page, "#card-set", "Card set");
  await expect(turn).toBeVisible();
  await expect(cardSet.getByRole("note")).toContainText(
    "Your clock keeps running while the card set is open.",
  );
  await expectScreenFits(page, "card-set-during-game", testInfo);
  await page.keyboard.press("Escape");
  await expect(cardSet).toBeHidden();
});

test("a visitor opens a card and goes back to the grid with the filters kept", async ({
  browser,
  viewport,
}, testInfo) => {
  const visitor = await openLobby(browser, "Detail Ann", viewport ?? undefined);
  const cardSet = await openPageByLink(visitor.page, "#card-set", "Card set");
  const sector = cardSet.getByRole("group", { name: "Sector" });
  await sector.getByRole("button", { name: "Residential" }).click();
  await cardSet.getByRole("group", { name: "Tier" }).getByRole("button", { name: "2" }).click();
  const tiles = cardSet.getByRole("list", { name: "Cards" }).getByRole("button");
  const residentialTier2 = await tiles.count();
  await tiles.filter({ hasText: "Repetitive Housing" }).click();

  const detail = visitor.page.getByRole("dialog", { name: "#23 Repetitive Housing" });
  await expect(detail).toBeVisible();
  await expect(detail.getByRole("article", { name: "Repetitive Housing" })).toBeVisible();
  await expect(detail.getByRole("definition").getByRole("img", { name: "Cost 9" })).toBeVisible();
  await expectScreenFits(visitor.page, "card-detail", testInfo);

  await detail.getByRole("button", { name: "Close" }).click();
  await expect(detail).toBeHidden();
  await expect(sector.getByRole("button", { name: "Residential" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(tiles).toHaveCount(residentialTier2);
  await expect(tiles.filter({ hasText: "Repetitive Housing" })).toBeFocused();

  await tiles.filter({ hasText: "Repetitive Housing" }).press("Enter");
  await expect(detail).toBeVisible();
  await visitor.page.keyboard.press("Escape");
  await expect(detail).toBeHidden();
  await expect(cardSet).toBeVisible();
  await visitor.page.keyboard.press("Escape");
  await expect(cardSet).toBeHidden();
});

test("a visitor filters and searches the card set", async ({ browser, viewport }, testInfo) => {
  const visitor = await openLobby(browser, "Cards Ann", viewport ?? undefined);
  const cardSet = await openPageByLink(visitor.page, "#card-set", "Card set");
  const tiles = cardSet.getByRole("list", { name: "Cards" }).getByRole("listitem");
  await expect(tiles).toHaveCount(240);
  await expect(cardSet.getByRole("status")).toHaveText("240 cards match");
  await expectScreenFits(visitor.page, "card-set", testInfo);

  await cardSet
    .getByRole("group", { name: "Sector" })
    .getByRole("button", { name: "Public" })
    .click();
  await cardSet.getByRole("group", { name: "Tier" }).getByRole("button", { name: "1" }).click();
  await cardSet
    .getByRole("group", { name: "Type" })
    .getByRole("button", { name: "Safety" })
    .click();
  await expect(tiles).toHaveCount(2);
  await expect(cardSet.getByRole("status")).toHaveText("2 cards match");

  await cardSet.getByRole("group", { name: "Sector" }).getByRole("button", { name: "All" }).click();
  await cardSet.getByRole("group", { name: "Tier" }).getByRole("button", { name: "All" }).click();
  await cardSet.getByRole("group", { name: "Type" }).getByRole("button", { name: "All" }).click();
  await cardSet.getByRole("searchbox", { name: "Search by card name" }).fill("row house");
  await expect(tiles).toHaveText([/Row House/, /Modern Row House/, /Tall Row Houses/]);

  await cardSet.getByRole("button", { name: "Back" }).click();
  await expect(cardSet).toBeHidden();
  await expect(visitor.page.getByRole("button", { name: "Create room" })).toBeVisible();
});
