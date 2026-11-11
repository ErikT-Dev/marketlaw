import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, type TestInfo } from "@playwright/test";

const MINIMUM_TARGET_PX = 24;

async function targetsSmallerThanMinimum(page: Page): Promise<ReadonlyArray<string>> {
  return page.evaluate((minimum) => {
    const targets = document.querySelectorAll("button, a, input, select, [role=tab]");
    return [...targets]
      .map((target) => ({ name: target.textContent, box: target.getBoundingClientRect() }))
      .filter(({ box }) => box.width > 0 && (box.width < minimum || box.height < minimum))
      .map(({ name, box }) => `${name} ${String(box.width)}x${String(box.height)}`);
  }, MINIMUM_TARGET_PX);
}

async function waitForTransitionsToEnd(page: Page) {
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every(
        (animation) => !(animation instanceof CSSTransition) || animation.playState !== "running",
      ),
  );
}

export async function expectScreenFits(
  page: Page,
  screen: string,
  testInfo: TestInfo,
  hasHumanCheck = false,
) {
  if (!hasHumanCheck) {
    await page.waitForLoadState("networkidle");
  }
  await page.waitForFunction(() => [...document.images].every((image) => image.complete));
  await page.screenshot({
    path: `harness/screens/${screen}/${screen}-${testInfo.project.name}.png`,
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(
    false,
  );
  expect(await targetsSmallerThanMinimum(page)).toEqual([]);
  await waitForTransitionsToEnd(page);
  expect(await new AxeBuilder({ page }).analyze()).toHaveProperty("violations", []);
}
