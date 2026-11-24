import { expect, test, type Browser, type Page, type ViewportSize } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { openTestSeat } from "./openTestSeat";
import { startTestRoom } from "./startTestRoom";

const LAST_TURN_WITH_THE_END_GOAL = {
  players: 2,
  turn: 12,
  seats: [{ seat: 1, stats: { income: 220 }, projects: ["quality", "satisfaction", "workforce"] }],
};

async function finishTheGame(
  browser: Browser,
  viewport: ViewportSize | null,
  links: ReadonlyArray<string>,
): Promise<readonly [Page, Page]> {
  const [one, two] = await Promise.all(
    links.map(async (link) => openTestSeat(browser, viewport, link)),
  );
  if (one === undefined || two === undefined) {
    throw new Error("no seats");
  }
  for (const page of [one, two]) {
    await page.getByRole("button", { name: "End turn" }).click();
  }
  for (const page of [one, two]) {
    await expect(page.getByRole("dialog", { name: "Seat 1 wins!" })).toBeVisible();
  }
  return [one, two];
}

async function closeToTheRoom(page: Page): Promise<void> {
  await page
    .getByRole("dialog", { name: "Seat 1 wins!" })
    .getByRole("button", { name: "Close" })
    .click();
  await expect(page.getByRole("heading", { name: "Players still in the room · 2" })).toBeVisible();
}

test("players in a finished room accept a rematch and see the new game", async ({
  browser,
  viewport,
  request,
}, testInfo) => {
  const [one, two] = await finishTheGame(
    browser,
    viewport,
    await startTestRoom(request, LAST_TURN_WITH_THE_END_GOAL),
  );
  await closeToTheRoom(one);
  await expect(one.getByText("Game over · You won with")).toBeVisible();
  await expect(one.getByText(/deleted when the last player leaves, or at \d\d:\d\d/)).toBeVisible();
  await expectScreenFits(one, "room-after-the-game", testInfo);

  await two
    .getByRole("dialog", { name: "Seat 1 wins!" })
    .getByRole("button", { name: "Ask for a rematch" })
    .click();
  for (const page of [one, two]) {
    const asked = page.getByRole("dialog", { name: "Accept a rematch?" });
    await expect(asked).toContainText("Nobody has accepted yet.");
    await expect(asked.getByRole("timer")).toContainText(/0:[0-2]\d left to accept/);
  }
  await one.getByRole("button", { name: "Accept" }).click();
  await expect(two.getByRole("dialog", { name: "Accept a rematch?" })).toContainText(
    "Accepted so far: Seat 1",
  );
  await expectScreenFits(two, "rematch-asked", testInfo);
  await two.getByRole("button", { name: "Accept" }).click();
  for (const page of [one, two]) {
    await expect(page.getByRole("heading", { name: "Turn 1 of 40" })).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
});

test("a declined rematch leaves the finished room as it was", async ({
  browser,
  viewport,
  request,
}) => {
  const [one, two] = await finishTheGame(
    browser,
    viewport,
    await startTestRoom(request, LAST_TURN_WITH_THE_END_GOAL),
  );
  for (const page of [one, two]) {
    await closeToTheRoom(page);
  }
  await one.getByRole("button", { name: "Ask for a rematch" }).click();
  await two
    .getByRole("dialog", { name: "Accept a rematch?" })
    .getByRole("button", { name: "Decline" })
    .click();
  for (const page of [one, two]) {
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Players still in the room · 2" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Ask for a rematch" })).toBeEnabled();
  }
});
