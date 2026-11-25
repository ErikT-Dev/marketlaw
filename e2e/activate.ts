import type { Locator } from "@playwright/test";
import type { Player } from "./Player";
import { pressWithKeyboard } from "./pressWithKeyboard";

export async function activate(player: Player, target: Locator): Promise<void> {
  if (player.isKeyboardOnly) {
    await pressWithKeyboard(player.page, target);
    return;
  }
  await target.click();
}
