import { expect, test } from "@playwright/test";
import { expectWhiteTextButtons } from "./expectWhiteTextButtons";
import { startTestRoom } from "./startTestRoom";

test("the action buttons have white text on dark backgrounds, normal and highlighted", async ({
  page,
  request,
}) => {
  const [seatOne = ""] = await startTestRoom(request, {
    players: 2,
    seats: [{ seat: 1, stats: { workforce: 1, quality: 1, product: 1 }, hand: ["Liquor Shop"] }],
  });
  await page.goto(seatOne);
  await expect(page.getByRole("heading", { name: "Turn 1 of 40" })).toBeVisible();
  const actions = page.getByRole("region", { name: "Actions" });
  await page
    .getByRole("list", { name: "Your hand" })
    .getByRole("button", { name: "Liquor Shop" })
    .click();
  await expect(async () => {
    await expectWhiteTextButtons(actions, [
      /^Redraw hand/u,
      "Play card",
      "Sell cards",
      /^Use/u,
      "Projects",
      "End turn",
    ]);
  }).toPass();
  const selected = page.getByRole("region", { name: "Selected card: Liquor Shop" });
  await selected.getByRole("button", { name: "Play card" }).click();
  await expect(
    actions.getByRole("button", {
      name: "End turn",
      description: "You have played a card this turn",
    }),
  ).toBeVisible();
  await expect(async () => {
    await expectWhiteTextButtons(actions, ["End turn"]);
  }).toPass();
  const panelBackground = await actions.evaluate(
    (panel) => getComputedStyle(panel).backgroundColor,
  );
  expect(panelBackground).toMatch(/\/ 0\.75\)$/u);
});

test("the lobby buttons have white text on dark backgrounds", async ({ page }) => {
  await page.goto("/");
  const lobby = page.locator("body");
  await expect(page.getByRole("button", { name: "Create room" })).toBeVisible();
  await expect(async () => {
    await expectWhiteTextButtons(lobby, [
      "Game menu",
      "ELO ranking",
      "Log in",
      "Sign up",
      "Create room",
    ]);
  }).toPass();
});
