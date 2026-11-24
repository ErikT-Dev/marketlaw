import { expect, test, type Page } from "@playwright/test";
import { becomeGuest } from "./becomeGuest";
import { expectScreenFits } from "./expectScreenFits";
import { openLobby } from "./openLobby";

const PARTS = [
  "Who runs MarketLaw",
  "What is stored and why",
  "How long",
  "Who else handles it",
  "Picture credits",
  "Your choices",
];

async function expectEveryPart(page: Page) {
  const notice = page.getByRole("dialog", { name: "Privacy notice" });
  await expect(notice.getByRole("heading", { level: 2 })).toHaveText(PARTS);
  await expect(notice).toContainText("mlaw.support@gmail.com");
  await expect(notice.getByRole("list", { name: "Artists" })).toContainText("Delapouite");
  return notice;
}

test("a visitor opens the privacy notice from signup and goes back to the filled-in form", async ({
  browser,
  viewport,
}, testInfo) => {
  const visitor = await openLobby(browser, "Privacy Ann", viewport ?? undefined);
  await visitor.page.getByRole("button", { name: "Sign up" }).click();
  const signUp = visitor.page.getByRole("dialog", { name: "Sign up" });
  await signUp.getByLabel("Email address").fill("privacy.ann@example.com");
  await signUp.getByRole("link", { name: "Privacy notice" }).click();
  const notice = await expectEveryPart(visitor.page);
  await expectScreenFits(visitor.page, "privacy-notice", testInfo, true);
  await notice.getByRole("button", { name: "Back" }).click();
  await expect(notice).toBeHidden();
  await expect(signUp.getByLabel("Email address")).toHaveValue("privacy.ann@example.com");
  await signUp.getByRole("link", { name: "Privacy notice" }).click();
  await expectEveryPart(visitor.page);
  await visitor.page.keyboard.press("Escape");
  await expect(visitor.page.getByRole("dialog", { name: "Privacy notice" })).toBeHidden();
  await expect(signUp).toBeVisible();
});

test("a guest opens the privacy notice from account settings and a direct link", async ({
  browser,
  viewport,
}) => {
  const guest = await openLobby(browser, "Privacy Bea", viewport ?? undefined);
  await guest.page.getByRole("button", { name: "Create room" }).click();
  await becomeGuest(guest);
  const create = guest.page.getByRole("dialog", { name: "Create a room" });
  await guest.page.keyboard.press("Escape");
  await expect(create).toBeHidden();
  await guest.page.getByRole("button", { name: "Your account" }).click();
  await guest.page
    .getByRole("list", { name: "User menu" })
    .getByRole("button", { name: "Account settings" })
    .click();
  const settings = guest.page.getByRole("dialog", { name: "Account settings" });
  await settings.getByRole("link", { name: "Privacy notice" }).click();
  const notice = await expectEveryPart(guest.page);
  await notice.getByRole("button", { name: "Back" }).click();
  await expect(settings).toBeVisible();

  await guest.page.goto("about:blank");
  await guest.page.goto("/#privacy");
  const linked = await expectEveryPart(guest.page);
  await linked.getByRole("button", { name: "Back" }).click();
  await expect(linked).toBeHidden();
  await expect(guest.page.getByRole("button", { name: "Your account" })).toBeVisible();
});
