import { expect, test, type Browser, type Page, type ViewportSize } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { handOf } from "./handOf";
import { hiddenCardsSentToOthers } from "./hiddenCardsSentToOthers";
import type { Player } from "./Player";
import { signedInPlayer } from "./signedInPlayer";

const CARDS_TO_SWAP_IN = ["Naval Base", "City Hall"];

type PlayMessageChange = (text: string) => string | null;

async function changePlayMessages(page: Page, change: PlayMessageChange): Promise<void> {
  await page.routeWebSocket(/\/api\/rooms\/[A-Z0-9]+\/socket$/, (socket) => {
    const server = socket.connectToServer();
    socket.onMessage((message) => {
      const text = String(message);
      const changed = text.includes('"play_card"') ? change(text) : text;
      if (changed !== null) {
        server.send(changed);
      }
    });
  });
}

async function startTwoPlayerGame(
  browser: Browser,
  viewport: ViewportSize | null,
  change: PlayMessageChange,
): Promise<ReadonlyArray<Player>> {
  const size = viewport ?? { width: 1920, height: 1080 };
  const ann = await signedInPlayer(browser, "Ann", size);
  const bea = await signedInPlayer(browser, "Bea", size);
  await changePlayMessages(ann.page, change);
  await ann.page.getByRole("button", { name: "Create room" }).click();
  await expect(ann.page.getByRole("heading", { name: "Waiting for players" })).toBeVisible();
  const code = (await ann.page.getByLabel("Room code").textContent()) ?? "";
  await bea.page.getByLabel("Room code").fill(code);
  await bea.page.getByRole("button", { name: "Join room" }).click();
  await expect(ann.page.getByRole("heading", { name: "Turn 1 of 40" })).toBeVisible();
  return [ann, bea];
}

async function firstPlayableCard(page: Page): Promise<string> {
  const hand = page.getByRole("list", { name: "Your hand" });
  for (const card of await handOf(page)) {
    const button = hand.getByRole("button", { name: card, exact: true });
    const description = await button.getAttribute("aria-describedby");
    const isPlayable = !(await page.locator(`[id="${description ?? ""}"]`).textContent())?.includes(
      "cannot be played",
    );
    if (isPlayable) {
      return card;
    }
  }
  throw new Error("no playable card in the starting hand");
}

async function playFirstPlayableCard(page: Page): Promise<string> {
  const card = await firstPlayableCard(page);
  await page.getByRole("list", { name: "Your hand" }).getByRole("button", { name: card }).click();
  await page
    .getByRole("region", { name: `Selected card: ${card}` })
    .getByRole("button", { name: "Play card" })
    .click();
  return card;
}

test("a rejected move rolls back and says why", async ({ browser, viewport }, testInfo) => {
  let cardNotInHand = "";
  const players = await startTwoPlayerGame(browser, viewport, (text) =>
    text.replace(/"card":"[^"]+"/, `"card":"${cardNotInHand}"`),
  );
  const ann = players[0]?.page;
  if (ann === undefined) {
    throw new Error("no players");
  }
  const annHand = await handOf(ann);
  cardNotInHand = CARDS_TO_SWAP_IN.find((swapIn) => !annHand.includes(swapIn)) ?? "";
  const card = await playFirstPlayableCard(ann);
  await expect(ann.getByRole("alert")).toContainText("That card is not in your hand any more.");
  const hand = ann.getByRole("list", { name: "Your hand" });
  await expect(hand.getByRole("button", { name: card, exact: true })).toBeEnabled();
  await expect(ann.getByRole("region", { name: /^Your city/ })).toContainText("Empty");
  await expectScreenFits(ann, "move-rejected", testInfo);
  expect(await hiddenCardsSentToOthers(players)).toEqual([]);
  await Promise.all(players.map(async (player) => player.page.context().close()));
});

test("a move waiting for the server is faded and blocks other moves", async ({
  browser,
  viewport,
}, testInfo) => {
  const players = await startTwoPlayerGame(browser, viewport, () => null);
  const ann = players[0]?.page;
  if (ann === undefined) {
    throw new Error("no players");
  }
  const card = await playFirstPlayableCard(ann);
  const pending = ann.getByRole("list", { name: "Your hand" }).getByRole("button", { name: card });
  await expect(pending).toBeDisabled();
  await expect(pending.getByRole("status")).toHaveText("Waiting for the server…");
  await expect(ann.getByRole("button", { name: "End turn" })).toBeDisabled();
  await expectScreenFits(ann, "move-pending", testInfo);
  await Promise.all(players.map(async (player) => player.page.context().close()));
});
