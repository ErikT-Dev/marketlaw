import { expect, test } from "@playwright/test";
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

  const opponents = page.getByRole("group", { name: "Opponents" });
  await opponents.focus();
  await expect(opponents).toBeFocused();
  await expect(opponents).toHaveCSS("outline-style", "solid");
  await expect(opponents.getByText("Funds", { exact: true }).first()).toBeHidden();

  const useInfluence = page.getByRole("button", { name: "Use Influence" });
  await useInfluence.focus();
  await expect(useInfluence.getByText("Influence", { exact: true })).toBeVisible();
  await context.close();
});
