import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import * as v from "valibot";
import { TEST_ROOM_SECRET_HEADER } from "../src/shared/api/TEST_ROOM_SECRET_HEADER";
import { TestOutboxResponse } from "../src/shared/api/TestOutboxResponse";
import { readLocalTestRoomSecret } from "../tools/test-room/readLocalTestRoomSecret";
import { expectScreenFits } from "./expectScreenFits";
import { HUMAN_CHECK_MS } from "./HUMAN_CHECK_MS";
import { openLobby } from "./openLobby";
import { SIGNING_IN_TEST_MS } from "./SIGNING_IN_TEST_MS";

const PASSWORD = "harbour lights 42";
const NEW_PASSWORD = "quiet tides 77";

async function newestLinkSentTo(
  request: APIRequestContext,
  to: string,
  fragment: string,
): Promise<string> {
  const response = await request.post("/api/test-outbox", {
    headers: { [TEST_ROOM_SECRET_HEADER]: readLocalTestRoomSecret() },
    data: { to },
  });
  const { emails } = v.parse(TestOutboxResponse, await response.json());
  const pattern = new RegExp(`/#${fragment}=[\\w-]+`);
  const link = emails.flatMap((email) => pattern.exec(email.text) ?? [])[0];
  if (link === undefined) {
    throw new Error(`no ${fragment} link was sent`);
  }
  return link;
}

async function openLink(page: Page, link: string): Promise<void> {
  await page.goto("about:blank");
  await page.goto(link);
}

async function signUp(page: Page, name: string, email: string): Promise<void> {
  await page.getByRole("button", { name: "Sign up" }).click();
  const dialog = page.getByRole("dialog", { name: "Sign up" });
  await expect(dialog.getByLabel("Username")).not.toHaveValue("");
  await dialog.getByLabel("Username").fill(name);
  await dialog.getByLabel("Email address").fill(email);
  await dialog.getByLabel("Password").fill(PASSWORD);
  const send = dialog.getByRole("button", { name: "Sign up" });
  await expect(send).toBeEnabled({ timeout: HUMAN_CHECK_MS });
  await send.click();
  await expect(dialog).toBeHidden({ timeout: HUMAN_CHECK_MS });
}

test("a player confirms the email address from its link and sets a new password", async ({
  browser,
  request,
  viewport,
}, testInfo) => {
  test.setTimeout(SIGNING_IN_TEST_MS);
  const size = viewport ?? { width: 1920, height: 1080 };
  const player = await openLobby(browser, "Prompt Mill Warden", size);
  const email = `${player.name.replaceAll(" ", ".").toLowerCase()}@example.com`;
  await signUp(player.page, player.name, email);
  const checkEmail = player.page.getByRole("dialog", { name: "Check your email" });
  await expect(checkEmail).toContainText(`We sent a link to ${email}.`);
  await checkEmail.getByRole("button", { name: "Send it again" }).click();
  await expect(checkEmail.getByText("We sent the link again.")).toBeVisible();
  await expectScreenFits(player.page, "check-your-email", testInfo);
  await checkEmail.getByRole("button", { name: "OK" }).click();

  const confirmLink = await newestLinkSentTo(request, email, "confirm");
  await openLink(player.page, confirmLink);
  const confirmed = player.page.getByRole("dialog", { name: "Email address confirmed" });
  await expect(confirmed).toBeVisible();
  await expectScreenFits(player.page, "email-confirmed", testInfo);
  await confirmed.getByRole("button", { name: "OK" }).click();

  await openLink(player.page, confirmLink);
  const expired = player.page.getByRole("dialog", { name: "This link no longer works" });
  await expect(expired.getByRole("button", { name: "Forgot password" })).toBeVisible();
  await expectScreenFits(player.page, "link-expired", testInfo);
  await expired.getByRole("button", { name: "Close" }).click();
  await expect(expired).toBeHidden();

  const second = await openLobby(browser, player.name, size);
  await second.page.getByRole("button", { name: "Log in" }).click();
  const logIn = second.page.getByRole("dialog", { name: "Log in" });
  await logIn.getByRole("button", { name: "Forgot your password?" }).click();
  const forgot = second.page.getByRole("dialog", { name: "Forgot your password?" });
  await forgot.getByLabel("Email address").fill(email.toUpperCase());
  const sendLink = forgot.getByRole("button", { name: "Send link" });
  await expect(sendLink).toBeEnabled({ timeout: HUMAN_CHECK_MS });
  await expectScreenFits(second.page, "forgot-password", testInfo, true);
  await sendLink.click();
  const resetSent = second.page.getByRole("dialog", { name: "Check your email" });
  await expect(resetSent).toContainText("Open it within 1 hour");
  await resetSent.getByRole("button", { name: "OK" }).click();

  await openLink(second.page, await newestLinkSentTo(request, email, "reset"));
  const newPassword = second.page.getByRole("dialog", { name: "Set a new password" });
  await newPassword.getByLabel("New password", { exact: true }).fill(NEW_PASSWORD);
  await newPassword.getByLabel("New password again").fill(NEW_PASSWORD);
  await expectScreenFits(second.page, "set-new-password", testInfo);
  await newPassword.getByRole("button", { name: "Set password" }).click();
  await expect(newPassword).toBeHidden();
  await expect(second.page.getByLabel("Your account")).toContainText(player.name);
  await Promise.all([player, second].map(async (each) => each.page.context().close()));
});
