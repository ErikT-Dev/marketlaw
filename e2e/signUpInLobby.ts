import { expect, type Page } from "@playwright/test";
import { HUMAN_CHECK_MS } from "./HUMAN_CHECK_MS";

export async function signUpInLobby(
  page: Page,
  name: string,
  email: string,
  password: string,
): Promise<void> {
  await page.getByRole("button", { name: "Sign up" }).click();
  const dialog = page.getByRole("dialog", { name: "Sign up" });
  await expect(dialog.getByLabel("Username")).not.toHaveValue("");
  await dialog.getByLabel("Username").fill(name);
  await dialog.getByLabel("Email address").fill(email);
  await dialog.getByLabel("Password").fill(password);
  const send = dialog.getByRole("button", { name: "Sign up" });
  await expect(send).toBeEnabled({ timeout: HUMAN_CHECK_MS });
  await send.click();
  await expect(dialog).toBeHidden({ timeout: HUMAN_CHECK_MS });
}
