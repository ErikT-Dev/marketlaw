import { expect, test, type Browser, type Page, type ViewportSize } from "@playwright/test";
import { confirmEmailOf, signUpUnconfirmed } from "./confirmEmailOf";
import { expectScreenFits } from "./expectScreenFits";
import { openLobby } from "./openLobby";
import type { Player } from "./Player";
import { SIGNING_IN_TEST_MS } from "./SIGNING_IN_TEST_MS";
import { withRankedQueueLock } from "./withRankedQueueLock";

const NOT_STARTED =
  "The match did not start because a player did not confirm. You are back at the front of the queue.";

function rankedPanel(page: Page) {
  return page.getByRole("region", { name: "Ranked queue" });
}

async function openTwoLobbies(
  browser: Browser,
  viewport: ViewportSize | null,
  bases: readonly [string, string],
): Promise<readonly [Player, Player]> {
  const size = viewport ?? { width: 1920, height: 1080 };
  return Promise.all([openLobby(browser, bases[0], size), openLobby(browser, bases[1], size)]);
}

async function joinTwoPlayerQueue(player: Player): Promise<void> {
  const panel = rankedPanel(player.page);
  await panel.getByRole("switch", { name: "2 players" }).check();
  await panel.getByRole("switch", { name: "3 players" }).uncheck();
  await panel.getByRole("button", { name: "Join the ranked queue" }).click();
  await expect(panel.getByRole("button", { name: "Leave the queue" })).toBeVisible();
}

async function leaveQueueIfIn(player: Player): Promise<void> {
  const leave = rankedPanel(player.page).getByRole("button", { name: "Leave the queue" });
  if (await leave.isVisible()) {
    await leave.click();
  }
}

async function changeSizesInQueue(page: Page): Promise<void> {
  const panel = rankedPanel(page);
  const fourPlayers = panel.getByRole("switch", { name: "4 players" });
  await fourPlayers.click();
  await expect(fourPlayers).toBeChecked();
  await fourPlayers.click();
  await expect(fourPlayers).not.toBeChecked();
  await expect(panel.getByRole("switch", { name: "2 players" })).toBeDisabled();
}

async function confirmMatch(ann: Player, bea: Player): Promise<void> {
  const annDialog = ann.page.getByRole("dialog", { name: "2-player match found!" });
  const beaDialog = bea.page.getByRole("dialog", { name: "2-player match found!" });
  await beaDialog.getByRole("button", { name: "Confirm" }).click();
  await expect(beaDialog).toContainText("Confirmed. Waiting for the other players.");
  await annDialog.getByRole("button", { name: "Confirm" }).click();
  for (const player of [ann, bea]) {
    await expect(player.page.getByRole("heading", { name: /^Turn 1( of 40)?$/ })).toBeVisible();
  }
}

test("registered players join the ranked queue, confirm a match and play a ranked game", async ({
  browser,
  request,
  viewport,
}, testInfo) => {
  test.setTimeout(SIGNING_IN_TEST_MS);
  const [ann, bea] = await openTwoLobbies(browser, viewport, ["Ranked Ann", "Ranked Bea"]);
  const annPanel = rankedPanel(ann.page);
  const join = annPanel.getByRole("button", { name: "Join the ranked queue" });
  await expect(annPanel).toContainText("Log in or sign up to play ranked games.");
  await expect(join).toBeDisabled();
  await Promise.all([signUpUnconfirmed(ann), signUpUnconfirmed(bea)]);
  await expect(annPanel).toContainText("Confirm your email address to play ranked games.");
  await expect(annPanel.getByRole("button", { name: "Send it again" })).toBeVisible();
  await expectScreenFits(ann.page, "lobby-ranked-locked", testInfo);
  await confirmEmailOf(ann, request);
  await confirmEmailOf(bea, request);
  await expect(join).toBeEnabled();

  await withRankedQueueLock(async () => {
    try {
      await joinTwoPlayerQueue(ann);
      await expect(annPanel.getByText("You are in the queue")).toBeVisible();
      await expect(ann.page.getByRole("button", { name: "Create room" })).toBeDisabled();
      await changeSizesInQueue(ann.page);
      await expectScreenFits(ann.page, "lobby-in-the-ranked-queue", testInfo);
      await joinTwoPlayerQueue(bea);
      const annDialog = ann.page.getByRole("dialog", { name: "2-player match found!" });
      await expect(annDialog).toContainText("A ranked game with 2 players is ready.");
      await expect(annDialog).not.toContainText(bea.name);
      await expect(annPanel).not.toContainText("including you");
      await expectScreenFits(ann.page, "lobby-match-found", testInfo);
      await confirmMatch(ann, bea);
    } finally {
      await Promise.all([leaveQueueIfIn(ann), leaveQueueIfIn(bea)]);
    }
  });
});

test("a player who declines a match waits before joining again while the other stays queued", async ({
  browser,
  request,
  viewport,
}) => {
  test.setTimeout(SIGNING_IN_TEST_MS);
  const [cat, dan] = await openTwoLobbies(browser, viewport, ["Ranked Cat", "Ranked Dan"]);
  await Promise.all([signUpUnconfirmed(cat), signUpUnconfirmed(dan)]);
  await confirmEmailOf(cat, request);
  await confirmEmailOf(dan, request);
  const catPanel = rankedPanel(cat.page);
  const danPanel = rankedPanel(dan.page);

  await withRankedQueueLock(async () => {
    try {
      await joinTwoPlayerQueue(dan);
      await joinTwoPlayerQueue(cat);
      await cat.page
        .getByRole("dialog", { name: "2-player match found!" })
        .getByRole("button", { name: "Decline" })
        .click();
      await expect(cat.page.getByRole("status")).toContainText(
        /You did not confirm the match and left the queue\. You can join it again in [12]:\d\d\./,
      );
      await expect(catPanel).toContainText(/You can join the ranked queue again in [12]:\d\d\./);
      await expect(catPanel.getByRole("button", { name: "Join the ranked queue" })).toBeDisabled();
      await expect(dan.page.getByRole("status")).toContainText(NOT_STARTED);
      await expect(danPanel.getByText("You are in the queue")).toBeVisible();
      await danPanel.getByRole("button", { name: "Leave the queue" }).click();
      await expect(danPanel.getByRole("button", { name: "Join the ranked queue" })).toBeEnabled();
    } finally {
      await Promise.all([leaveQueueIfIn(cat), leaveQueueIfIn(dan)]);
    }
  });
});
