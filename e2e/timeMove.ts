import type { Locator, Page } from "@playwright/test";
import type { ShownUntilAnswered } from "./ShownUntilAnswered";

export async function timeMove(
  page: Page,
  move: Locator,
  shownUntilAnswered: ShownUntilAnswered,
): Promise<number> {
  await page.evaluate(() => {
    document.addEventListener(
      "click",
      () => {
        document.documentElement.dataset["moveClickedAt"] = String(performance.now());
      },
      { capture: true, once: true },
    );
  });
  await move.click();
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
