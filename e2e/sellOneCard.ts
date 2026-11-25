import { expect } from "@playwright/test";
import { activate } from "./activate";
import { cardsHeldOnce } from "./cardsHeldOnce";
import type { Player } from "./Player";

export async function sellOneCard(player: Player): Promise<void> {
  const { page } = player;
  const [card = ""] = await cardsHeldOnce(page);
  const cardInHand = page
    .getByRole("list", { name: "Your hand" })
    .getByRole("button", { name: card, exact: true });
  await activate(player, page.getByRole("button", { name: "Sell cards" }));
  await activate(player, cardInHand);
  await activate(player, page.getByRole("button", { name: "Sell 1 card" }));
  await expect(cardInHand).toHaveCount(0);
}
