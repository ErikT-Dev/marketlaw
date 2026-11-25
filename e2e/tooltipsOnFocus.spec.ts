import { expect, test } from "@playwright/test";
import { openTestSeat } from "./openTestSeat";
import { startTestRoom } from "./startTestRoom";

test("a focused control shows its icon tooltip and a focused panel around icons shows none", async ({
  browser,
  request,
}) => {
  const [seatOne = ""] = await startTestRoom(request, { players: 4 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  await page.goto(seatOne);
  await expect(page.getByRole("heading", { name: /^Turn \d+ of 40$/ })).toBeVisible();

  const opponents = page.getByRole("group", { name: "Players" });
  await opponents.focus();
  await expect(opponents).toBeFocused();
  await expect(opponents).toHaveCSS("outline-style", "solid");
  await expect(opponents.getByText("Funds", { exact: true }).first()).toBeHidden();

  const useInfluence = page.getByRole("button", { name: "Use Influence" });
  await useInfluence.focus();
  await expect(useInfluence.getByText("Influence", { exact: true })).toBeVisible();
  await context.close();
});

test("a focused red card name shows its tooltip without the name tooltips of the icons inside it", async ({
  browser,
  viewport,
  request,
}) => {
  const [seatOne = ""] = await startTestRoom(request, {
    players: 2,
    turn: 2,
    seats: [{ seat: 1, city: ["Lake Park"], hand: ["Hiking Trail"] }],
  });
  const ann = await openTestSeat(browser, viewport, seatOne);
  await ann
    .getByRole("list", { name: "Your hand" })
    .getByRole("button", { name: "Hiking Trail", exact: true })
    .click();
  const shown = ann.getByRole("region", { name: "Selected card: Hiking Trail" });
  const name = shown.getByRole("button", { name: "Hiking Trail!" });
  const tooltip = shown.getByRole("tooltip").filter({ hasText: "Playing it makes" });
  await name.focus();
  await ann.keyboard.press("Shift+Tab");
  await ann.keyboard.press("Tab");
  await expect(name).toBeFocused();
  await expect(tooltip).toBeVisible();
  await expect(tooltip.getByRole("img", { name: "Satisfaction 1" }).first()).toBeVisible();
  const iconNames = tooltip.getByText("Satisfaction", { exact: true });
  await expect(iconNames).toHaveCount(2);
  for (const iconName of await iconNames.all()) {
    await expect(iconName).toBeHidden();
  }
  await ann.context().close();
});
