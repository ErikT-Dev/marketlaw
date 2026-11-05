import { expect, type Page } from "@playwright/test";
import { cardsHeldOnce } from "./cardsHeldOnce";

export async function sellOneCard(page: Page): Promise<void> {
  const [card = ""] = await cardsHeldOnce(page);
  const cardInHand = page
    .getByRole("list", { name: "Your hand" })
    .getByRole("button", { name: card, exact: true });
  await page.getByRole("button", { name: "Sell cards" }).click();
  await cardInHand.click();
  await page.getByRole("button", { name: "Sell 1 card" }).click();
  await expect(cardInHand).toHaveCount(0);
}
