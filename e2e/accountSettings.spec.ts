import { expect, test, type Page } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { HUMAN_CHECK_MS } from "./HUMAN_CHECK_MS";
import { newestLinkSentTo } from "./newestLinkSentTo";
import { openLink } from "./openLink";
import { openLobby } from "./openLobby";
import { signUpInLobby } from "./signUpInLobby";
import { SIGNING_IN_TEST_MS } from "./SIGNING_IN_TEST_MS";
import { startGame } from "./startGame";

const PASSWORD = "harbour lights 42";
const TURN_HEADING = /^Turn \d+ of 40$/;

function emailOf(name: string): string {
  return `${name.replaceAll(" ", ".").toLowerCase()}@example.com`;
}

async function signUpAndCloseNotice(page: Page, name: string, email: string): Promise<void> {
  await signUpInLobby(page, name, email, PASSWORD);
  const checkEmail = page.getByRole("dialog", { name: "Check your email" });
  await checkEmail.getByRole("button", { name: "OK" }).click();
  await expect(checkEmail).toBeHidden();
}

async function openSettings(page: Page) {
  await page.getByRole("button", { name: "Your account" }).click();
  await page
    .getByRole("list", { name: "User menu" })
    .getByRole("button", { name: "Account settings" })
    .click();
  return page.getByRole("dialog", { name: "Account settings" });
}

test("a player whose address another account confirmed adds a new one and deletes the account", async ({
  browser,
  request,
  viewport,
}, testInfo) => {
  test.setTimeout(SIGNING_IN_TEST_MS);
  const size = viewport ?? { width: 1920, height: 1080 };
  const ann = await openLobby(browser, "Settings Ann", size);
  const bea = await openLobby(browser, "Settings Bea", size);
  const shared = emailOf(ann.name);
  await signUpAndCloseNotice(ann.page, ann.name, shared);
  const annSettings = await openSettings(ann.page);
  await expect(annSettings).toContainText(`${shared} not confirmed`);
  await annSettings.getByRole("button", { name: "Send it again" }).click();
  await expect(annSettings.getByText("We sent the link again.")).toBeVisible();
  await annSettings.getByRole("button", { name: "Close" }).click();

  await signUpAndCloseNotice(bea.page, bea.name, shared);
  await openLink(bea.page, await newestLinkSentTo(request, shared, "confirm"));
  const confirmed = bea.page.getByRole("dialog", { name: "Email address confirmed" });
  await confirmed.getByRole("button", { name: "OK" }).click();
  const beaSettings = await openSettings(bea.page);
  await expect(beaSettings).toContainText(`${shared} ✓ confirmed`);
  await beaSettings.getByRole("button", { name: "Change email address" }).click();
  const change = bea.page.getByRole("dialog", { name: "Change email address" });
  await change.getByLabel("New email address").fill(emailOf(bea.name));
  const sendChange = change.getByRole("button", { name: "Send link" });
  await expect(sendChange).toBeEnabled({ timeout: HUMAN_CHECK_MS });
  await expectScreenFits(bea.page, "change-email", testInfo, true);
  await sendChange.click();
  await expect(beaSettings).toContainText(`Waiting for confirmation: ${emailOf(bea.name)}.`);
  await expectScreenFits(bea.page, "account-settings-email", testInfo);

  const removed = await openSettings(ann.page);
  await expect(removed).toContainText("Your email address was removed");
  await expectScreenFits(ann.page, "account-settings-email-removed", testInfo);
  await removed.getByRole("button", { name: "Add an email address" }).click();
  const add = ann.page.getByRole("dialog", { name: "Add an email address" });
  await add.getByLabel("New email address").fill(`new.${shared}`);
  const sendAdd = add.getByRole("button", { name: "Send link" });
  await expect(sendAdd).toBeEnabled({ timeout: HUMAN_CHECK_MS });
  await sendAdd.click();
  await expect(removed).toContainText(`Waiting for confirmation: new.${shared}.`);

  await removed.getByRole("button", { name: "Delete account" }).click();
  const deleting = ann.page.getByRole("dialog", { name: "Delete your account?" });
  await deleting.getByLabel("Password").fill("not my password");
  await deleting.getByRole("button", { name: "Delete account" }).click();
  await expect(deleting).toContainText("Wrong password.");
  await deleting.getByLabel("Password").fill(PASSWORD);
  await expectScreenFits(ann.page, "delete-account", testInfo);
  await deleting.getByRole("button", { name: "Delete account" }).click();
  await expect(ann.page.getByRole("button", { name: "Log in" })).toBeVisible();
  await Promise.all([ann, bea].map(async (each) => each.page.context().close()));
});

test("a player who deletes the account during a game leaves it", async ({
  browser,
  viewport,
}, testInfo) => {
  const size = viewport ?? { width: 1920, height: 1080 };
  const [ann, bea, cy] = await startGame(browser, size, ["Delete Ann", "Delete Bea", "Delete Cy"]);
  if (ann === undefined || bea === undefined || cy === undefined) {
    throw new Error("no players");
  }
  await expect(ann.page.getByRole("heading", { name: TURN_HEADING })).toBeVisible();
  await ann.page.getByRole("button", { name: "Your account" }).click();
  await ann.page
    .getByRole("list", { name: "User menu" })
    .getByRole("button", { name: "Sign up to keep your account" })
    .click();
  const signUp = ann.page.getByRole("dialog", { name: "Sign up" });
  await signUp.getByLabel("Email address").fill(emailOf(ann.name));
  await signUp.getByLabel("Password").fill(PASSWORD);
  const send = signUp.getByRole("button", { name: "Sign up" });
  await expect(send).toBeEnabled({ timeout: HUMAN_CHECK_MS });
  await send.click();
  await ann.page
    .getByRole("dialog", { name: "Check your email" })
    .getByRole("button", { name: "OK" })
    .click();
  const settings = await openSettings(ann.page);
  await settings.getByRole("button", { name: "Delete account" }).click();
  const deleting = ann.page.getByRole("dialog", { name: "Delete your account during a game?" });
  await expect(deleting).toContainText("Deleting your account counts as leaving it");
  await deleting.getByLabel("Password").fill(PASSWORD);
  await expectScreenFits(ann.page, "delete-account-during-a-game", testInfo);
  await deleting.getByRole("button", { name: "Leave the game and delete" }).click();
  await expect(ann.page.getByRole("button", { name: "Log in" })).toBeVisible();
  await expect(bea.page.getByRole("list", { name: "Player order" })).toContainText(
    `${ann.name}left`,
  );
  await Promise.all([ann, bea, cy].map(async (each) => each.page.context().close()));
});
