import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { SESSION_KEY } from "../src/client/store/SESSION_KEY";
import { expectScreenFits } from "./expectScreenFits";
import { HUMAN_CHECK_MS } from "./HUMAN_CHECK_MS";
import { openLobby } from "./openLobby";
import { startGame } from "./startGame";

const PASSWORD = "harbour lights 42";
const TURN_HEADING = /^Turn \d+ of 40$/;

function userMenuOf(page: Page) {
  return page.getByRole("list", { name: "User menu" });
}

async function openUserMenu(page: Page) {
  await page.getByRole("button", { name: "Your account" }).click();
  return userMenuOf(page);
}

async function signUpFromMenu(page: Page, email: string, testInfo: TestInfo) {
  const menu = await openUserMenu(page);
  await menu.getByRole("button", { name: "Sign up to keep your account" }).click();
  const signUp = page.getByRole("dialog", { name: "Sign up" });
  await signUp.getByLabel("Email address").fill(email);
  await signUp.getByLabel("Password").fill(PASSWORD);
  const send = signUp.getByRole("button", { name: "Sign up" });
  await expect(send).toBeEnabled({ timeout: HUMAN_CHECK_MS });
  await expectScreenFits(page, "sign-up-during-a-game", testInfo, true);
  await send.click();
  await expect(signUp).toBeHidden({ timeout: HUMAN_CHECK_MS });
  const checkEmail = page.getByRole("dialog", { name: "Check your email" });
  await expect(checkEmail).toContainText(email);
  await checkEmail.getByRole("button", { name: "OK" }).click();
  await expect(checkEmail).toBeHidden();
}

test("a guest signs up during a game, keeps the seat, logs out and logs back in", async ({
  browser,
  viewport,
}, testInfo) => {
  const size = viewport ?? { width: 1920, height: 1080 };
  const [ann, bea, cy] = await startGame(browser, size, ["Ann Menu", "Bea Menu", "Cy Menu"]);
  if (ann === undefined || bea === undefined || cy === undefined) {
    throw new Error("no players");
  }
  const guestMenu = await openUserMenu(ann.page);
  await expect(guestMenu.getByRole("button")).toHaveText([
    "Sign up to keep your account",
    "Account settings",
    "My match history",
    "Log out",
  ]);
  await expectScreenFits(ann.page, "user-menu-guest", testInfo);
  await ann.page.keyboard.press("Escape");
  await expect(userMenuOf(ann.page)).toBeHidden();

  const email = `${ann.name.replaceAll(" ", ".").toLowerCase()}@example.com`;
  await signUpFromMenu(ann.page, email, testInfo);
  await expect(ann.page.getByRole("heading", { name: TURN_HEADING })).toBeVisible();
  const annBox = ann.page.getByRole("button", { name: "Your account" });
  await expect(annBox).toContainText(ann.name);
  await expect(annBox).not.toContainText("Guest");
  await expect(await openUserMenu(ann.page)).not.toContainText("Sign up");
  await expectScreenFits(ann.page, "user-menu", testInfo);
  await userMenuOf(ann.page).getByRole("button", { name: "Account settings" }).click();
  const settings = ann.page.getByRole("dialog", { name: "Account settings" });
  await expect(settings).toContainText("You can change it once every 7 days.");
  await expectScreenFits(ann.page, "account-settings", testInfo);
  const newName = `${ann.name} B`;
  await settings.getByLabel("Username").fill(newName);
  await settings.getByRole("button", { name: "Change", exact: true }).click();
  await expect(settings).toContainText(/You changed it on \d+ \w+\. You can change it again on/);
  await expect(settings.getByLabel("Username")).toBeDisabled();
  await settings.getByRole("button", { name: "Close" }).click();
  await expect(annBox).toContainText(newName);
  await expect(ann.page.getByRole("list", { name: "Player order" })).not.toContainText(newName);

  const beaMenu = await openUserMenu(bea.page);
  await beaMenu.getByRole("button", { name: "Account settings" }).click();
  const beaSettings = bea.page.getByRole("dialog", { name: "Account settings" });
  await expect(beaSettings).toContainText("You are playing as a guest");
  await expectScreenFits(bea.page, "account-settings-guest", testInfo);
  await beaSettings.getByRole("button", { name: "Log out" }).click();
  const warning = bea.page.getByRole("dialog", { name: "Log out of a guest account?" });
  await expect(warning).toContainText("you cannot log back in");
  await expectScreenFits(bea.page, "guest-log-out-warning", testInfo);
  await warning.getByRole("button", { name: "Log out anyway" }).click();
  await expect(bea.page.getByRole("button", { name: "Log in" })).toBeVisible();
  await expect(cy.page.getByRole("list", { name: "Player order" })).toContainText(
    `${bea.name}left`,
  );

  const code = await ann.page.evaluate((key) => {
    const stored: unknown = JSON.parse(localStorage.getItem(key) ?? "{}");
    return typeof stored === "object" && stored !== null && "roomCode" in stored
      ? String(stored.roomCode)
      : "";
  }, SESSION_KEY);
  await (await openUserMenu(ann.page)).getByRole("button", { name: "Log out" }).click();
  await expect(ann.page.getByRole("button", { name: "Log in" })).toBeVisible();

  const second = await openLobby(browser, ann.name, size);
  await second.page.getByRole("button", { name: "Log in" }).click();
  const logIn = second.page.getByRole("dialog", { name: "Log in" });
  await logIn.getByLabel("Username or email").fill(email);
  await logIn.getByLabel("Password").fill(PASSWORD);
  await logIn.getByRole("button", { name: "Log in" }).click();
  await expect(logIn).toBeHidden();
  await second.page.getByRole("textbox", { name: "Room code" }).fill(code);
  await second.page.getByRole("button", { name: "Join with code" }).click();
  await expect(second.page.getByRole("heading", { name: TURN_HEADING })).toBeVisible();
  await expect(second.page.getByRole("button", { name: "Your account" })).toContainText(newName);
  await Promise.all([ann, bea, cy, second].map(async (each) => each.page.context().close()));
});
