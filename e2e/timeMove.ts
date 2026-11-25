import type { Locator } from "@playwright/test";
import { activate } from "./activate";
import type { Player } from "./Player";
import type { ShownUntilAnswered } from "./ShownUntilAnswered";

export async function timeMove(
  player: Player,
  move: Locator,
  shownUntilAnswered: ShownUntilAnswered,
): Promise<number> {
  const { page } = player;
  await page.evaluate(() => {
    document.addEventListener(
      "click",
      () => {
        document.documentElement.dataset["moveClickedAt"] = String(performance.now());
      },
      { capture: true, once: true },
    );
  });
  await activate(player, move);
  const elapsed = await page.waitForFunction(
    ({ selector, texts }) => {
      const clickedAt = document.documentElement.dataset["moveClickedAt"];
      const isStillShown = [...document.querySelectorAll(selector)].some((element) =>
        texts.includes(element.textContent.trim()),
      );
      return clickedAt === undefined || isStillShown
        ? ""
        : String(performance.now() - Number(clickedAt));
    },
    shownUntilAnswered,
    { polling: "raf" },
  );
  return Number(await elapsed.jsonValue());
}
