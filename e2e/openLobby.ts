import { expect, type Browser, type ViewportSize } from "@playwright/test";
import type { Player } from "./Player";
import { uniqueName } from "./uniqueName";

export async function openLobby(
  browser: Browser,
  base: string,
  viewport?: ViewportSize,
  isKeyboardOnly = false,
): Promise<Player> {
  const context = await browser.newContext(viewport === undefined ? {} : { viewport });
  if (isKeyboardOnly) {
    await context.addInitScript(() => {
      document.addEventListener(
        "pointerdown",
        () => {
          document.documentElement.dataset["pointerUsed"] = "yes";
        },
        { capture: true },
      );
    });
  }
  const page = await context.newPage();
  const frames: string[] = [];
  page.on("websocket", (socket) => {
    socket.on("framereceived", (frame) => {
      frames.push(String(frame.payload));
    });
  });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Create room" })).toBeVisible();
  return { page, frames, name: uniqueName(base), isKeyboardOnly };
}
