import { expect, test } from "@playwright/test";
import { becomeGuest } from "./becomeGuest";
import { expectScreenFits } from "./expectScreenFits";
import { openLobby } from "./openLobby";
import { SIGNING_IN_TEST_MS } from "./SIGNING_IN_TEST_MS";

test("a guest changes their player icon in account settings", async ({
  browser,
  viewport,
}, testInfo) => {
  test.setTimeout(SIGNING_IN_TEST_MS);
  const guest = await openLobby(browser, "Icon Ann", viewport ?? undefined);
  await guest.page.getByRole("button", { name: "Create room" }).click();
  await becomeGuest(guest);
  await guest.page.keyboard.press("Escape");
  await expect(guest.page.getByRole("dialog", { name: "Create a room" })).toBeHidden();
  await guest.page.getByRole("button", { name: "Your account" }).click();
  await guest.page
    .getByRole("list", { name: "User menu" })
    .getByRole("button", { name: "Account settings" })
    .click();
  const settings = guest.page.getByRole("dialog", { name: "Account settings" });
  await settings.getByRole("button", { name: "Change icon" }).click();
  const picker = settings.getByRole("form", { name: "Change icon" });
  await picker.getByRole("button", { name: "Wolf head by Lorc" }).click();
  await picker.getByLabel("Background colour").fill("#000000");
  await picker.getByLabel("Picture colour").fill("#000001");
  await expect(picker.getByText("These colours are too alike.")).toBeVisible();
  await expect(picker.getByRole("button", { name: "Save" })).toBeDisabled();
  await picker.getByLabel("Picture colour").fill("#ffffff");
  const preview = picker.getByRole("img", { name: "Preview" });
  const pictureUrl = await preview
    .locator("span")
    .evaluate((face) => getComputedStyle(face).maskImage.replace(/^url\("?|"?\)$/gu, ""));
  expect(pictureUrl).toContain("wolf-head");
  expect((await guest.page.request.get(pictureUrl)).ok()).toBe(true);
  await settings.getByRole("link", { name: "Privacy notice" }).scrollIntoViewIfNeeded();
  await expectScreenFits(guest.page, "icon-picker", testInfo);
  const saved = guest.page.waitForResponse((response) =>
    response.url().endsWith("/api/icon-changes"),
  );
  await picker.getByRole("button", { name: "Save" }).click();
  expect((await saved).ok()).toBe(true);
  await expect(picker).toBeHidden();
  await settings.getByRole("button", { name: "Change icon" }).click();
  await expect(
    picker.getByRole("button", { name: "Wolf head by Lorc", pressed: true }),
  ).toBeVisible();
  await expect(picker.getByText("You can change it 10 times in 24 hours.")).toBeVisible();
});
