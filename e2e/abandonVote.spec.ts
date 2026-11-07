import { expect, test, type Browser, type Page, type ViewportSize } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { openTestSeat } from "./openTestSeat";
import { startTestRoom } from "./startTestRoom";

type ThreeSeats = readonly [Page, Page, Page];

async function openThreeSeats(
  browser: Browser,
  viewport: ViewportSize | null,
  links: ReadonlyArray<string>,
): Promise<ThreeSeats> {
  const [one, two, three] = await Promise.all(
    links.map(async (link) => openTestSeat(browser, viewport, link)),
  );
  if (one === undefined || two === undefined || three === undefined) {
    throw new Error("no seats");
  }
  return [one, two, three];
}

async function callVote(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Vote to abandon" }).click();
  await page
    .getByRole("dialog", { name: "Call a vote to abandon the game?" })
    .getByRole("button", { name: "Call the vote" })
    .click();
}

async function answerVote(page: Page, answer: "Yes, abandon" | "No, keep playing") {
  await page
    .getByRole("dialog", { name: "Abandon the game?" })
    .getByRole("button", { name: answer })
    .click();
}

test("three players call a vote and all vote yes, so the game is abandoned", async ({
  browser,
  viewport,
  request,
}, testInfo) => {
  const links = await startTestRoom(request, { players: 3 });
  const [one, two, three] = await openThreeSeats(browser, viewport, links);
  await one.getByRole("button", { name: "Vote to abandon" }).click();
  await expect(one.getByRole("dialog", { name: "Call a vote to abandon the game?" })).toContainText(
    "All clocks keep running during the vote.",
  );
  await expectScreenFits(one, "call-abandon-vote", testInfo);
  await one.getByRole("button", { name: "Call the vote" }).click();
  await expect(one.getByRole("status").filter({ hasText: "You called a vote." })).toContainText(
    "0 of 2 players answered",
  );

  await answerVote(two, "Yes, abandon");
  const asked = three.getByRole("dialog", { name: "Abandon the game?" });
  await expect(asked).toContainText("Seat 1 called a vote to abandon the game.");
  await expect(asked).toContainText("1 of 2 players answered");
  await expect(asked.getByRole("timer")).toContainText(/0:[0-5]\d left to answer/);
  await expect(two.getByRole("status").filter({ hasText: "Seat 1 called a vote." })).toContainText(
    "1 of 2 players answered",
  );
  await expectScreenFits(three, "answer-abandon-vote", testInfo);

  await answerVote(three, "Yes, abandon");
  for (const page of [one, two, three]) {
    const abandoned = page.getByRole("dialog", { name: "The game was abandoned" });
    await expect(abandoned).toContainText(
      "All players voted yes, so the game ended with no winner.",
    );
    await expect(abandoned.getByRole("table")).toHaveCount(0);
  }
  await expectScreenFits(one, "game-over-abandoned-by-vote", testInfo);
});

test("a vote with one no fails, the game goes on and the next vote is 5 turns later", async ({
  browser,
  viewport,
  request,
}, testInfo) => {
  const links = await startTestRoom(request, { players: 3 });
  const [one, two, three] = await openThreeSeats(browser, viewport, links);
  await callVote(one);
  await answerVote(two, "Yes, abandon");
  await answerVote(three, "No, keep playing");
  for (const page of [one, two, three]) {
    await expect(page.getByRole("status").filter({ hasText: "The game goes on" })).toContainText(
      /Not every player voted yes to abandon the game\. The next vote is possible in turn \d+\./,
    );
  }
  await expect(one.getByRole("dialog")).toHaveCount(0);
  await expectScreenFits(one, "vote-failed", testInfo);

  await callVote(two);
  await expect(two.getByRole("alert")).toContainText(/Next vote possible in turn \d+\./);
});
