import { expect } from "@playwright/test";
import { becomeGuest } from "./becomeGuest";
import { HUMAN_CHECK_MS } from "./HUMAN_CHECK_MS";
import type { Player } from "./Player";

export async function createRoomAs(player: Player, size: 2 | 3 | 4): Promise<string> {
  const { page } = player;
  await page.getByRole("button", { name: "Create room" }).click();
  await becomeGuest(player);
  const dialog = page.getByRole("dialog", { name: "Create a room" });
  await dialog.getByRole("button", { name: `${String(size)} players` }).click();
  const create = dialog.getByRole("button", { name: "Create room" });
  await expect(create).toBeEnabled({ timeout: HUMAN_CHECK_MS });
  await create.click();
  const heading = page.getByRole("heading", { name: /^Room [A-Z0-9]{6}$/ });
  await expect(heading).toBeVisible();
  return ((await heading.textContent()) ?? "").replace("Room ", "");
}
