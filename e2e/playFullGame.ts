import { expect, test, type Browser, type TestInfo, type ViewportSize } from "@playwright/test";
import { endTurnForEveryone } from "./endTurnForEveryone";
import { expectScreenFits } from "./expectScreenFits";
import { FULL_GAME_TEST_MS } from "./FULL_GAME_TEST_MS";
import { hiddenCardsSentToOthers } from "./hiddenCardsSentToOthers";
import { playMarketPhase } from "./playMarketPhase";
import type { Player } from "./Player";
import { sellOneCard } from "./sellOneCard";
import { startGame } from "./startGame";

const LAST_TURN = 40;

async function expectGameOverAtTheTurnLimit(players: ReadonlyArray<Player>) {
  for (const { page } of players) {
    const dialog = page.getByRole("dialog", { name: / wins!$/ });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Nobody reached the end goal by turn 40, the last turn");
    await expect(dialog.getByRole("table", { name: "Places" }).getByRole("row")).toHaveCount(
      players.length + 1,
    );
  }
}

export async function playFullGame(
  browser: Browser,
  viewport: ViewportSize,
  bases: ReadonlyArray<string>,
  keyboardOnlyBases: ReadonlyArray<string>,
  testInfo: TestInfo,
): Promise<ReadonlyArray<number>> {
  const players = await startGame(
    browser,
    viewport,
    bases,
    async () => Promise.resolve(),
    keyboardOnlyBases,
  );
  test.setTimeout(FULL_GAME_TEST_MS);
  const host = players[0]?.page;
  if (host === undefined) {
    throw new Error("no host");
  }
  const screen = `full-game-${String(players.length)}-players`;
  await expectScreenFits(host, `${screen}-turn-1`, testInfo);
  expect(await hiddenCardsSentToOthers(players)).toEqual([]);
  for (const player of players) {
    await sellOneCard(player);
  }
  const times = [...(await endTurnForEveryone(players))];
  for (let turn = 2; turn <= LAST_TURN; turn += 1) {
    await expect(host.getByRole("heading", { name: `Turn ${String(turn)} of 40` })).toBeVisible();
    times.push(...(await playMarketPhase(players, turn, turn === 2)));
    if (turn === LAST_TURN) {
      await expect(host.getByRole("button", { name: "End turn" })).toBeVisible();
      await expectScreenFits(host, `${screen}-turn-40`, testInfo);
    }
    times.push(...(await endTurnForEveryone(players)));
  }
  await expectGameOverAtTheTurnLimit(players);
  await expectScreenFits(host, `${screen}-game-over`, testInfo);
  for (const { page } of players.filter(({ isKeyboardOnly }) => isKeyboardOnly)) {
    expect(
      await page.evaluate(() => document.documentElement.dataset["pointerUsed"]),
    ).toBeUndefined();
  }
  await Promise.all(players.map(async ({ page }) => page.context().close()));
  return times;
}
