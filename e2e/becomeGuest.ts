import { expect } from "@playwright/test";
import { activate } from "./activate";
import { enterText } from "./enterText";
import { HUMAN_CHECK_MS } from "./HUMAN_CHECK_MS";
import type { Player } from "./Player";

export async function becomeGuest(player: Player): Promise<void> {
  const dialog = player.page.getByRole("dialog", { name: "Choose a username" });
  await enterText(player, dialog.getByRole("textbox", { name: "Username" }), player.name);
  const proceed = dialog.getByRole("button", { name: "Continue" });
  await expect(proceed).toBeEnabled({ timeout: HUMAN_CHECK_MS });
  const guestCreated = player.page.waitForResponse(
    (response) => response.url().endsWith("/api/guests") && response.request().method() === "POST",
    { timeout: HUMAN_CHECK_MS },
  );
  await activate(player, proceed);
  await guestCreated;
  await expect(dialog).toBeHidden();
}
