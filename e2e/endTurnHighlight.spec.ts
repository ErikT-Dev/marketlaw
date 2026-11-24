import { expect, test } from "@playwright/test";
import { startTestRoom } from "./startTestRoom";

test("playing a card highlights End turn", async ({ page, request }) => {
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
  await expect(highlightedEndTurn).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "has increased!" })).toHaveCount(0);
});
