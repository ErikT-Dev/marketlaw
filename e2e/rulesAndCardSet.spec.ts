import { expect, test, type Page } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { openLobby } from "./openLobby";
import { startTestRoom } from "./startTestRoom";

async function openRulesByLink(page: Page, hash: string) {
  await page.evaluate((rulesHash) => {
    window.location.hash = rulesHash;
  }, hash);
  const rules = page.getByRole("dialog", { name: "Rules" });
  await expect(rules).toBeVisible();
  return rules;
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
});
