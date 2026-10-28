import { expect, type Browser, type ViewportSize } from "@playwright/test";
import type { Player } from "./Player";

export async function signedInPlayer(
  browser: Browser,
  name: string,
  viewport?: ViewportSize,
): Promise<Player> {
  const context = await browser.newContext(viewport === undefined ? {} : { viewport });
  const page = await context.newPage();
  const frames: string[] = [];
  page.on("websocket", (socket) => {
    socket.on("framereceived", (frame) => {
      frames.push(String(frame.payload));
    });
  });
  await page.goto("/");
  await page.getByLabel("Your name").fill(name);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: `Hello, ${name}` })).toBeVisible();
  return { page, frames };
}
