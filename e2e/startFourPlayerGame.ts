import type { Browser, ViewportSize } from "@playwright/test";
import { LONGEST_NAMES } from "./LONGEST_NAMES";
import type { Player } from "./Player";
import { startGame } from "./startGame";

export async function startFourPlayerGame(
  browser: Browser,
  viewport: ViewportSize,
): Promise<ReadonlyArray<Player>> {
  return startGame(browser, viewport, LONGEST_NAMES);
}
