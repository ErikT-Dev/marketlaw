import { expect } from "@playwright/test";
import { becomeGuest } from "./becomeGuest";
import type { Player } from "./Player";

export async function joinRoomAs(player: Player, code: string): Promise<void> {
  const { page } = player;
  await page.getByRole("textbox", { name: "Room code" }).fill(code);
  await page.getByRole("button", { name: "Join with code" }).click();
  await becomeGuest(player);
  await expect(page.getByRole("heading", { name: `Room ${code}` })).toBeVisible();
}
