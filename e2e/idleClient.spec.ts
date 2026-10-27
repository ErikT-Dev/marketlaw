import { expect, test } from "@playwright/test";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

test("an idle connected client sends no messages for five minutes", async ({ page }) => {
  await page.clock.install();
  const sentFrames: string[] = [];
  page.on("websocket", (socket) => {
    socket.on("framesent", (frame) => {
      sentFrames.push(String(frame.payload));
    });
  });
  await page.goto("/");
  await page.getByLabel("Your name").fill("Idle");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Create room" }).click();
  await expect(page.getByRole("heading", { name: "Waiting for players" })).toBeVisible();
  const sentWhileConnecting = sentFrames.length;
  await page.clock.runFor(FIVE_MINUTES_MS);
  expect(sentWhileConnecting).toBe(1);
  expect(sentFrames).toHaveLength(sentWhileConnecting);
});
