import type { Locator } from "@playwright/test";
import type { Player } from "./Player";
import { tabTo } from "./tabTo";

export async function enterText(player: Player, field: Locator, text: string): Promise<void> {
  if (player.isKeyboardOnly) {
    await tabTo(player.page, field);
    await player.page.keyboard.type(text);
    return;
  }
  await field.fill(text);
}
