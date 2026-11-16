import { expect, test } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { startTestRoom } from "./startTestRoom";

test("playing a card highlights End turn and a rise in income shows a notice that closes after 3 seconds", async ({
  page,
  request,
}, testInfo) => {
  const [seatOne = ""] = await startTestRoom(request, {
    players: 2,
    seats: [{ seat: 1, stats: { workforce: 1, quality: 1, product: 1 }, hand: ["Liquor Shop"] }],
  });
  await page.goto(seatOne);
  await expect(page.getByRole("heading", { name: "Turn 1 of 40" })).toBeVisible();
  const highlightedEndTurn = page.getByRole("button", {
    name: "End turn",
    description: "You have played a card this turn",
  });
  await expect(highlightedEndTurn).toHaveCount(0);
  await page
    .getByRole("list", { name: "Your hand" })
    .getByRole("button", { name: "Liquor Shop" })
    .click();
  await page
    .getByRole("region", { name: "Selected card: Liquor Shop" })
    .getByRole("button", { name: "Play card" })
    .click();
  const notice = page.getByRole("status").filter({ hasText: "has increased!" });
  await expect(notice.getByRole("img", { name: "Income" })).toBeVisible();
  await expect(highlightedEndTurn).toBeVisible();
  await expectScreenFits(page, "income-notice", testInfo);
  await expect(notice).toHaveCount(0);
  await expect(highlightedEndTurn).toBeVisible();
});
