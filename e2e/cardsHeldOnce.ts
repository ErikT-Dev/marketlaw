import type { Page } from "@playwright/test";
import { handOf } from "./handOf";

export async function cardsHeldOnce(page: Page): Promise<ReadonlyArray<string>> {
  const hand = await handOf(page);
  return hand.filter((card) => hand.indexOf(card) === hand.lastIndexOf(card));
}
