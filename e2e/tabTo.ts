import { expect, type Locator, type Page } from "@playwright/test";

const MOST_TABS = 300;

async function isFocused(target: Locator): Promise<boolean> {
  return target.evaluate((element) => element === document.activeElement);
}

export async function tabTo(page: Page, target: Locator): Promise<void> {
  await expect(target).toBeVisible();
  for (let tabs = 0; !(await isFocused(target)); tabs += 1) {
    if (tabs === MOST_TABS) {
      throw new Error(`Tab never reaches ${target.toString()}`);
    }
    await page.keyboard.press("Tab");
  }
}
