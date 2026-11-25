import type { Locator, Page } from "@playwright/test";
import { tabTo } from "./tabTo";

export async function pressWithKeyboard(page: Page, target: Locator): Promise<void> {
  await tabTo(page, target);
  await page.keyboard.press("Enter");
}
