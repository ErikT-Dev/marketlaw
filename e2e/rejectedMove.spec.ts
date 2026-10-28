import { expect, test, type Page } from "@playwright/test";
import { handOf } from "./handOf";
import { signedInPlayer } from "./signedInPlayer";

const CARDS_TO_SWAP_IN = ["Naval Base", "City Hall"];

async function swapCardInEveryPlay(page: Page, cardNotInHand: () => string): Promise<void> {
  await page.routeWebSocket(/\/api\/rooms\/[A-Z0-9]+\/socket$/, (socket) => {
    const server = socket.connectToServer();
    socket.onMessage((message) => {
      const text = String(message);
      server.send(
        text.includes('"play_card"')
          ? text.replace(/"card":"[^"]+"/, `"card":"${cardNotInHand()}"`)
          : text,
      );
    });
  });
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

test("a rejected move rolls back and says why", async ({ browser }) => {
  const ann = await signedInPlayer(browser, "Ann");
  const bea = await signedInPlayer(browser, "Bea");
  let cardNotInHand = "";
  await swapCardInEveryPlay(ann.page, () => cardNotInHand);
  await ann.page.getByRole("button", { name: "Create room" }).click();
  await expect(ann.page.getByRole("heading", { name: "Waiting for players" })).toBeVisible();
  const code = (await ann.page.getByLabel("Room code").textContent()) ?? "";
  await bea.page.getByLabel("Room code").fill(code);
  await bea.page.getByRole("button", { name: "Join room" }).click();
  await expect(ann.page.getByRole("heading", { name: "Turn 1 of 40" })).toBeVisible();
  const card = await firstPlayableCard(ann.page);
  const annHand = await handOf(ann.page);
  cardNotInHand = CARDS_TO_SWAP_IN.find((swapIn) => !annHand.includes(swapIn)) ?? "";
  const hand = ann.page.getByRole("list", { name: "Your hand" });
  await hand.getByRole("button", { name: card, exact: true }).click();
  await ann.page
    .getByRole("region", { name: `Selected card: ${card}` })
    .getByRole("button", { name: "Play card" })
    .click();
  await expect(ann.page.getByRole("alert")).toContainText(
    "That card is not in your hand any more.",
  );
  await expect(hand.getByRole("button", { name: card, exact: true })).toBeEnabled();
  await expect(ann.page.getByRole("region", { name: /^Your city/ })).toContainText("Empty");
});
