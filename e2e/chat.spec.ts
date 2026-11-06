import { expect, test, type Page } from "@playwright/test";
import { createRoomAs } from "./createRoomAs";
import { expectScreenFits } from "./expectScreenFits";
import { joinRoomAs } from "./joinRoomAs";
import { openLobby } from "./openLobby";
import { SIGNING_IN_TEST_MS } from "./SIGNING_IN_TEST_MS";

function chatOf(page: Page) {
  return page.getByRole("list", { name: "Chat messages" });
}

async function sendChat(page: Page, text: string): Promise<void> {
  const input = page.getByRole("textbox", { name: "Message the room" });
  await input.fill(text);
  await input.press("Enter");
  await expect(input).toHaveValue("");
}

test("players chat in the waiting room and in the game, each in their own window", async ({
  browser,
  viewport,
}, testInfo) => {
  test.setTimeout(SIGNING_IN_TEST_MS);
  const size = viewport ?? { width: 1920, height: 1080 };
  const [ann, bea, cid] = await Promise.all(
    ["Ann", "Bea", "Cid"].map(async (base) => openLobby(browser, base, size)),
  );
  if (ann === undefined || bea === undefined || cid === undefined) {
    throw new Error("no players");
  }
  const code = await createRoomAs(ann, 3);
  await joinRoomAs(bea, code);
  await expect(chatOf(ann.page)).toContainText(`${bea.name} joined the room.`);
  await sendChat(ann.page, "Hello all");
  await expect(chatOf(bea.page).getByRole("listitem").last()).toContainText(ann.name);
  await expect(chatOf(bea.page).getByRole("listitem").last()).toContainText("Hello all");
  await expect(chatOf(bea.page).getByRole("button", { name: `Mute ${ann.name}` })).toBeVisible();
  await expect(chatOf(ann.page).getByRole("listitem").last()).toHaveText(/^You\d\d:\d\dHello all$/);
  await sendChat(bea.page, "Hi! Waiting for one more?");
  await expect(chatOf(ann.page)).toContainText("Hi! Waiting for one more?");
  await expectScreenFits(bea.page, "waiting-room-chat", testInfo);
  await joinRoomAs(cid, code);
  await expect(chatOf(cid.page)).toContainText(`${cid.name} joined the room.`);
  await expect(chatOf(cid.page)).not.toContainText("Hello all");
  await expect(chatOf(cid.page)).not.toContainText("Hi! Waiting for one more?");
  await expect(chatOf(ann.page)).toContainText(`${cid.name} joined the room.`);
  for (const player of [ann, bea, cid]) {
    await player.page
      .getByRole("dialog", { name: "The room is full: accept the game?" })
      .getByRole("button", { name: "Accept" })
      .click();
  }
  for (const player of [ann, bea, cid]) {
    await expect(player.page.getByRole("heading", { name: /^Turn 1( of 40)?$/ })).toBeVisible();
  }
  await cid.page.getByRole("tab", { name: /^Chat/ }).click();
  await expect(chatOf(cid.page)).toContainText("The game started.");
  await sendChat(cid.page, "Good luck everyone!");
  await expect(chatOf(cid.page)).toContainText("Good luck everyone!");
  await ann.page.getByRole("tab", { name: "Chat, 1 new" }).click();
  await expect(chatOf(ann.page)).toContainText("Good luck everyone!");
  await expect(ann.page.getByRole("tab", { name: "Chat" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await sendChat(ann.page, "Income first for me.");
  await expect(chatOf(ann.page)).toContainText("Income first for me.");
  await bea.page.getByRole("tab", { name: "Chat, 2 new" }).click();
  await expect(chatOf(bea.page)).toContainText("Income first for me.");
  await expectScreenFits(ann.page, "game-chat", testInfo);
});
