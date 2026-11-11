import { expect, test, type Page } from "@playwright/test";
import * as v from "valibot";
import { TEST_ROOM_SECRET_HEADER } from "../src/shared/api/TEST_ROOM_SECRET_HEADER";
import { SESSION_KEY } from "../src/client/store/SESSION_KEY";
import { readLocalTestRoomSecret } from "../tools/test-room/readLocalTestRoomSecret";
import { becomeGuest } from "./becomeGuest";
import { expectScreenFits } from "./expectScreenFits";
import { HUMAN_CHECK_MS } from "./HUMAN_CHECK_MS";
import { openLobby } from "./openLobby";
import { SIGNING_IN_TEST_MS } from "./SIGNING_IN_TEST_MS";

const STORED_TOKEN = v.object({ token: v.string() });

async function tokenOf(page: Page): Promise<string> {
  const stored = await page.evaluate((key) => localStorage.getItem(key), SESSION_KEY);
  return v.parse(STORED_TOKEN, JSON.parse(stored ?? "null")).token;
}

test("a player who started 10 games today is told so when creating a room", async ({
  browser,
  viewport,
  request,
}, testInfo) => {
  test.setTimeout(SIGNING_IN_TEST_MS);
  const player = await openLobby(browser, "Daily Limit Dan", viewport ?? undefined);
  const { page } = player;
  await page.getByRole("button", { name: "Create room" }).click();
  await becomeGuest(player);
  const counts = await request.post("/api/test-daily-counts", {
    headers: { [TEST_ROOM_SECRET_HEADER]: readLocalTestRoomSecret() },
    data: { token: await tokenOf(page), actions: 0, gameStarts: 10 },
  });
  expect(counts.status()).toBe(204);
  const dialog = page.getByRole("dialog", { name: "Create a room" });
  await dialog.getByRole("button", { name: "2 players" }).click();
  const create = dialog.getByRole("button", { name: "Create room" });
  await expect(create).toBeEnabled({ timeout: HUMAN_CHECK_MS });
  await create.click();
  await expect(dialog.getByRole("alert")).toHaveText(
    "You have started 10 games today, the most per day. Try again after 00:00 UTC.",
  );
  await expect(create).toBeEnabled({ timeout: HUMAN_CHECK_MS });
  await expectScreenFits(page, "daily-limit", testInfo, true);
  await page.context().close();
});
