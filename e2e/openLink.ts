import type { Page } from "@playwright/test";

export async function openLink(page: Page, link: string): Promise<void> {
  await page.goto("about:blank");
  await page.goto(link);
}
