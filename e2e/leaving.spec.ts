import { expect, test, type Browser, type Page, type ViewportSize } from "@playwright/test";
import { TEST_ROOM_SECRET_HEADER } from "../src/shared/api/TEST_ROOM_SECRET_HEADER";
import { readLocalTestRoomSecret } from "../tools/test-room/readLocalTestRoomSecret";
import { expectScreenFits } from "./expectScreenFits";
import { startTestRoom } from "./startTestRoom";

const FREE_TIME_MS = 75_000;

async function openSeat(
  browser: Browser,
  viewport: ViewportSize | null,
  link: string,
): Promise<Page> {
  const context = await browser.newContext({ viewport: viewport ?? { width: 1920, height: 1080 } });
  const page = await context.newPage();
  await page.goto(link);
  await expect(page.getByRole("heading", { name: /^Turn \d+ of 40$/ })).toBeVisible();
  return page;
}

async function leaveGame(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Leave game" }).click();
  await page
    .getByRole("dialog", { name: "Leave the game?" })
    .getByRole("button", { name: "Leave the game" })
    .click();
}

function roomCodeOf(link: string): string {
  return new URLSearchParams(link.split("#")[1] ?? "").get("room") ?? "";
}

test("players leave one by one, the last player wins and the room is deleted", async ({
  browser,
  viewport,
  request,
}, testInfo) => {
  const links = await startTestRoom(request, { players: 3 });
  const [one, two, three] = await Promise.all(
    links.map(async (link) => openSeat(browser, viewport, link)),
  );
  if (one === undefined || two === undefined || three === undefined) {
    throw new Error("no seats");
  }
  await one.getByRole("button", { name: "Leave game" }).click();
  const asking = one.getByRole("dialog", { name: "Leave the game?" });
  await expect(asking).toContainText("you cannot come back and cannot win");
  await expectScreenFits(one, "leave-game", testInfo);
  await asking.getByRole("button", { name: "Leave the game" }).click();
  await expect(one.getByRole("heading", { name: "You left the game" })).toBeVisible();
  await expectScreenFits(one, "left-game", testInfo);

  await leaveGame(two);
  const won = three.getByRole("dialog", { name: "You win: everyone else left" });
  await expect(won).toContainText("so the game ended at once and you are 1st");
  await expect(won.getByRole("row")).toHaveCount(4);
  await expectScreenFits(three, "game-over-last-player", testInfo);
  await expect(one.getByRole("dialog", { name: "Seat 3 wins: everyone else left" })).toBeVisible();

  for (const page of [one, two, three]) {
    await page.getByRole("dialog").getByRole("button", { name: "Exit to lobby" }).click();
    await expect(page.getByRole("button", { name: "Create room" })).toBeVisible();
  }
  const exported = await request.get(`/api/rooms/${roomCodeOf(links[2] ?? "")}/replay`, {
    headers: { [TEST_ROOM_SECRET_HEADER]: readLocalTestRoomSecret() },
  });
  expect(exported.status()).toBe(200);
  expect(JSON.stringify(await exported.json())).toContain('"type":"leave_game"');

  await three.goto("about:blank");
  await three.goto(links[2] ?? "");
  const notFound = three.getByRole("dialog", { name: "Room not found" });
  await expect(notFound).toContainText("Rooms are deleted when the last player leaves");
  await expectScreenFits(three, "room-not-found", testInfo);
  await notFound.getByRole("button", { name: "Go to the lobby" }).click();
  await expect(notFound).toBeHidden();
});

test("when every player in a ranked game times out a third time at once, the game is abandoned", async ({
  browser,
  viewport,
  request,
}, testInfo) => {
  test.setTimeout(FREE_TIME_MS + 60_000);
  const seats = [1, 2].map((seat) => ({ seat, time_bank_ms: 0, timeouts_in_a_row: 2 }));
  const links = await startTestRoom(request, { kind: "ranked", players: 2, turn: 2, seats });
  const pages = await Promise.all(links.map(async (link) => openSeat(browser, viewport, link)));
  for (const page of pages) {
    const abandoned = page.getByRole("dialog", { name: "The game was abandoned" });
    await expect(abandoned).toContainText("left at the same moment", {
      timeout: FREE_TIME_MS + 15_000,
    });
    await expect(abandoned.getByRole("table")).toHaveCount(0);
  }
  const [first] = pages;
  if (first !== undefined) {
    await expectScreenFits(first, "game-over-abandoned", testInfo);
  }
});
