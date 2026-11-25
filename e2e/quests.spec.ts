import { expect, test, type Browser, type Page } from "@playwright/test";
import { endTurnForEveryone } from "./endTurnForEveryone";
import { expectScreenFits } from "./expectScreenFits";
import { playMarketPhase } from "./playMarketPhase";
import { startTestRoom } from "./startTestRoom";

const SEAT_ONE_READY_FOR_TRADING_POST = { seat: 1, city: ["Apparel Store"], stats: { income: 40 } };

async function seatPage(browser: Browser, link: string, turn: number): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await page.goto(link);
  await expect(page.getByRole("heading", { name: `Turn ${String(turn)} of 40` })).toBeVisible();
  return page;
}

function lastTurnQuests(page: Page) {
  return page
    .getByRole("region", { name: "Last turn" })
    .getByRole("list", { name: "Quests completed" });
}

function questCard(page: Page, quest: string) {
  return page.getByRole("list", { name: "Quests table" }).getByRole("region", { name: quest });
}

test("five quests with three-part requirements and four players can all be reached", async ({
  browser,
  request,
  viewport,
}, testInfo) => {
  const [seatOne = ""] = await startTestRoom(request, {
    players: 4,
    turn: 20,
    quests: [
      { quest: "Trading post" },
      { quest: "Market town" },
      { quest: "Shopping centre" },
      { quest: "Penthouses" },
      { quest: "Media city" },
    ],
    seats: [
      SEAT_ONE_READY_FOR_TRADING_POST,
      { seat: 2, city: ["Apparel Store"], stats: { income: 40 } },
    ],
  });
  const page = await seatPage(browser, seatOne, 20);
  await expect(page.getByRole("list", { name: "Quests table" }).getByRole("region")).toHaveCount(5);
  await expect(
    questCard(page, "Trading post").getByRole("button", { name: "Complete" }),
  ).toBeVisible();
  await expect(
    questCard(page, "Media city")
      .getByRole("list", { name: "Progress on Media city" })
      .getByRole("listitem"),
  ).toHaveCount(4);
  await expect(questCard(page, "Trading post").getByText("could complete it now")).toHaveCount(1);
  await expectScreenFits(page, "quests-table", testInfo);
  const help = page.getByRole("button", { name: "How quests work" });
  await help.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "How quests work" })).toContainText(
    "Quests are shared goals.",
  );
  await expectScreenFits(page, "quests-help", testInfo);
  await page.getByRole("heading", { name: "Your stats" }).click();
  await expect(page.getByRole("region", { name: "How quests work" })).toHaveCount(0);
  const cards = page.getByRole("list", { name: "Quests table" }).getByRole("region");
  if ((viewport?.width ?? 0) >= 1920) {
    for (const index of [0, 1, 2, 3, 4]) {
      await expect(cards.nth(index)).toBeInViewport();
    }
  }
  for (const index of [0, 1, 2, 3, 4]) {
    await cards.nth(index).scrollIntoViewIfNeeded();
    await expect(cards.nth(index)).toBeInViewport();
  }
  const complete = questCard(page, "Trading post").getByRole("button", { name: "Complete" });
  await complete.scrollIntoViewIfNeeded();
  await expect(complete).toBeInViewport();
});

test("a completed quest shows as completed, stays hidden from others until the main phase ends, then leaves", async ({
  browser,
  request,
}, testInfo) => {
  const [seatOne = "", seatTwo = ""] = await startTestRoom(request, {
    players: 2,
    turn: 3,
    quests: [
      { quest: "Trading post" },
      { quest: "Farmland" },
      { quest: "Sports town" },
      { quest: "Mining town" },
    ],
    seats: [SEAT_ONE_READY_FOR_TRADING_POST],
  });
  const one = await seatPage(browser, seatOne, 3);
  const two = await seatPage(browser, seatTwo, 3);
  await questCard(one, "Trading post").getByRole("button", { name: "Complete" }).click();
  await expect(
    questCard(one, "Trading post")
      .getByRole("listitem")
      .filter({ has: one.getByRole("button", { name: "You" }) }),
  ).toContainText("· completed");
  await expect(
    questCard(one, "Trading post").getByRole("button", { name: "Complete" }),
  ).toHaveCount(0);
  await expect(
    questCard(two, "Trading post").getByRole("button", { name: "Seat 1" }),
  ).toBeVisible();
  await expect(questCard(two, "Trading post").getByText("could complete it now")).toHaveCount(1);
  await expect(
    questCard(two, "Trading post").getByRole("listitem").filter({ hasText: "· completed" }),
  ).toHaveCount(0);
  for (const page of [one, two]) {
    await page.getByRole("button", { name: "End turn" }).click();
  }
  for (const page of [one, two]) {
    await expect(page.getByRole("heading", { name: "Turn 4 of 40" })).toBeVisible();
    await expect(questCard(page, "Trading post")).toHaveCount(1);
    await expect(lastTurnQuests(page).getByRole("listitem")).toHaveCount(1);
  }
  const lastTurn = one.getByRole("region", { name: "Last turn" });
  await expect(lastTurn).toBeInViewport();
  await expect(lastTurn.getByRole("heading", { name: "Last turn · Turn 3" })).toBeVisible();
  const yourRow = lastTurnQuests(one).getByRole("listitem");
  await expect(yourRow).toContainText("Trading post");
  await expect(yourRow.getByRole("button", { name: "You" })).toBeVisible();
  for (const part of ["+12 funds", "+2 influence"]) {
    await expect(yourRow.getByRole("img", { name: part })).toBeVisible();
  }
  await expect(lastTurnQuests(two).getByRole("button", { name: "Seat 1" })).toBeVisible();
  await expectScreenFits(one, "last-turn", testInfo);
  const players = [one, two].map((page, index) => ({
    page,
    frames: [],
    name: `Seat ${String(index + 1)}`,
    isKeyboardOnly: false,
  }));
  await playMarketPhase(players, 4);
  await endTurnForEveryone(players);
  for (const page of [one, two]) {
    await expect(page.getByRole("heading", { name: "Turn 5 of 40" })).toBeVisible();
    await expect(questCard(page, "Trading post")).toHaveCount(0);
    await expect(page.getByRole("list", { name: "Quests table" }).getByRole("region")).toHaveCount(
      4,
    );
  }
});
