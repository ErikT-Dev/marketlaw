import { expect, test } from "@playwright/test";
import { createRoomAs } from "./createRoomAs";
import { openLobby } from "./openLobby";
import { SIGNING_IN_TEST_MS } from "./SIGNING_IN_TEST_MS";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

test("an idle connected client sends no messages for five minutes", async ({ browser }) => {
  test.setTimeout(SIGNING_IN_TEST_MS);
  const player = await openLobby(browser, "Idle");
  const { page } = player;
  const sentFrames: string[] = [];
  page.on("websocket", (socket) => {
    socket.on("framesent", (frame) => {
      sentFrames.push(String(frame.payload));
    });
  });
  await createRoomAs(player, 4);
  await expect(page.getByRole("list", { name: "Players in the room" })).toBeVisible();
  await page.clock.install();
  const sentWhileConnecting = sentFrames.length;
  await page.clock.runFor(FIVE_MINUTES_MS);
  expect(sentWhileConnecting).toBe(1);
  expect(sentFrames).toHaveLength(sentWhileConnecting);
});
