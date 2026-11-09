import { expect, test, type Page } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { HUMAN_CHECK_MS } from "./HUMAN_CHECK_MS";
import { openLobby } from "./openLobby";
import { SIGNING_IN_TEST_MS } from "./SIGNING_IN_TEST_MS";

const PASSWORD = "harbour lights 42";
const WRONG_LOGIN = "Wrong username, email or password.";

async function submitLogin(page: Page, password: string): Promise<void> {
  const dialog = page.getByRole("dialog", { name: "Log in" });
  await dialog.getByLabel("Password").fill(password);
  const answered = page.waitForResponse((response) => response.url().endsWith("/api/logins"));
  await dialog.getByRole("button", { name: "Log in" }).click();
  await answered;
}

test("a player signs up when not logged in and logs in from a second browser", async ({
  browser,
  viewport,
}, testInfo) => {
  test.setTimeout(SIGNING_IN_TEST_MS);
  const size = viewport ?? { width: 1920, height: 1080 };
  const player = await openLobby(browser, "Lively Dock Alderman", size);
  const email = `${player.name.replaceAll(" ", ".").toLowerCase()}@example.com`;
  await player.page.getByRole("button", { name: "Sign up" }).click();
  const signUp = player.page.getByRole("dialog", { name: "Sign up" });
  await expect(signUp.getByLabel("Username")).not.toHaveValue("");
  await signUp.getByLabel("Username").fill(player.name);
  await signUp.getByLabel("Email address").fill(email);
  await signUp.getByLabel("Password").fill(PASSWORD);
  const send = signUp.getByRole("button", { name: "Sign up" });
  await expect(send).toBeEnabled({ timeout: HUMAN_CHECK_MS });
  await expectScreenFits(player.page, "sign-up", testInfo, true);
  await send.click();
  await expect(signUp).toBeHidden({ timeout: HUMAN_CHECK_MS });
  const account = player.page.getByLabel("Your account");
  await expect(account).toContainText(player.name);
  await expect(account).not.toContainText("Guest");
  await expect(player.page.getByRole("button", { name: "Log in" })).toBeHidden();

  const second = await openLobby(browser, player.name, size);
  await second.page.getByRole("button", { name: "Log in" }).click();
  const logIn = second.page.getByRole("dialog", { name: "Log in" });
  await logIn.getByLabel("Username or email").fill(email.toUpperCase());
  await expectScreenFits(second.page, "log-in", testInfo);
  for (const attempt of [1, 2, 3]) {
    await submitLogin(second.page, `not the password ${String(attempt)}`);
    await expect(logIn.getByText(WRONG_LOGIN)).toBeVisible();
  }
  await submitLogin(second.page, PASSWORD);
  await expect(logIn.getByText(/The account is never locked\./)).toBeVisible();
  await expect(logIn.getByRole("group", { name: "Human check" })).toBeVisible();
  const send2 = logIn.getByRole("button", { name: "Log in" });
  await expect(send2).toBeEnabled({ timeout: HUMAN_CHECK_MS });
  await expectScreenFits(second.page, "log-in-after-failed-attempts", testInfo, true);
  await submitLogin(second.page, PASSWORD);
  await expect(logIn).toBeHidden();
  await expect(second.page.getByLabel("Your account")).toContainText(player.name);
  await Promise.all([player, second].map(async (each) => each.page.context().close()));
});
