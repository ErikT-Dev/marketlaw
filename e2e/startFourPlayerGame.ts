import { expect, type Browser, type ViewportSize } from "@playwright/test";
import { LONGEST_NAMES } from "./LONGEST_NAMES";
import type { Player } from "./Player";
import { signedInPlayer } from "./signedInPlayer";

export async function startFourPlayerGame(
  browser: Browser,
  viewport: ViewportSize,
): Promise<ReadonlyArray<Player>> {
  const players = await Promise.all(
    LONGEST_NAMES.map((name) => signedInPlayer(browser, name, viewport)),
  );
  const [host, ...guests] = players;
  if (host === undefined) {
    throw new Error("no players");
  }
  await host.page.getByLabel("Players").selectOption("4");
  await host.page.getByRole("button", { name: "Create room" }).click();
  await expect(host.page.getByRole("heading", { name: "Waiting for players" })).toBeVisible();
  const code = (await host.page.getByLabel("Room code").textContent()) ?? "";
  for (const guest of guests) {
    await guest.page.getByLabel("Room code").fill(code);
    await guest.page.getByRole("button", { name: "Join room" }).click();
  }
  for (const player of players) {
    await expect(player.page.getByRole("heading", { name: "Turn 1 of 40" })).toBeVisible();
  }
  return players;
}
