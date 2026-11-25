import { expect, test, type Browser, type ViewportSize } from "@playwright/test";
import { activate } from "./activate";
import { createRoomAs } from "./createRoomAs";
import { joinRoomAs } from "./joinRoomAs";
import { openLobby } from "./openLobby";
import type { Player } from "./Player";
import { SIGNING_IN_TEST_MS } from "./SIGNING_IN_TEST_MS";

export async function startGame(
  browser: Browser,
  viewport: ViewportSize,
  bases: ReadonlyArray<string>,
  beforeCreating: (players: ReadonlyArray<Player>) => Promise<void> = async () => Promise.resolve(),
  keyboardOnlyBases: ReadonlyArray<string> = [],
): Promise<ReadonlyArray<Player>> {
  test.setTimeout(SIGNING_IN_TEST_MS);
  const players = await Promise.all(
    bases.map(async (base) => openLobby(browser, base, viewport, keyboardOnlyBases.includes(base))),
  );
  const [host, ...guests] = players;
  if (host === undefined) {
    throw new Error("no players");
  }
  await beforeCreating(players);
  const size = players.length === 2 || players.length === 3 ? players.length : 4;
  const code = await createRoomAs(host, size);
  for (const guest of guests) {
    await joinRoomAs(guest, code);
  }
  for (const player of players) {
    await activate(
      player,
      player.page
        .getByRole("dialog", { name: "The room is full: accept the game?" })
        .getByRole("button", { name: "Accept" }),
    );
  }
  for (const player of players) {
    await expect(player.page.getByRole("heading", { name: /^Turn 1( of 40)?$/ })).toBeVisible();
  }
  return players;
}
