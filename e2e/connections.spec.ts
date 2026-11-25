import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { TEST_ROOM_SECRET_HEADER } from "../src/shared/api/TEST_ROOM_SECRET_HEADER";
import { readLocalTestRoomSecret } from "../tools/test-room/readLocalTestRoomSecret";
import { expectScreenFits } from "./expectScreenFits";
import { handOf } from "./handOf";
import { hiddenCardsSentToOthers } from "./hiddenCardsSentToOthers";
import type { Player } from "./Player";
import { startTestRoom } from "./startTestRoom";

const TURN_ONE = { name: "Turn 1 of 40" };

async function openSeat(context: BrowserContext, link: string): Promise<Page> {
  return (await openPlayer(context, link)).page;
}

async function openPlayer(context: BrowserContext, link: string): Promise<Player> {
  const page = await context.newPage();
  const frames: string[] = [];
  page.on("websocket", (socket) => {
    socket.on("framereceived", (frame) => {
      frames.push(String(frame.payload));
    });
  });
  await page.goto(link);
  await expect(page.getByRole("heading", TURN_ONE)).toBeVisible();
  return { page, frames, name: "", isKeyboardOnly: false };
}

function opponent(page: Page, name: string) {
  return page
    .getByRole("region", { name: "Players" })
    .getByRole("article", { name: `Quick summary table of ${name}` });
}

function roomCodeOf(link: string): string {
  return new URLSearchParams(link.replace("/#", "")).get("room") ?? "";
}

test("a refresh mid-game comes back to the same game and hand", async ({ browser, request }) => {
  const [seatOne = ""] = await startTestRoom(request, { players: 2 });
  const page = await openSeat(await browser.newContext(), seatOne);
  const hand = await handOf(page);
  await page.reload();
  await expect(page.getByRole("heading", TURN_ONE)).toBeVisible();
  expect(await handOf(page)).toEqual(hand);
});

function orderBadge(page: Page, name: string) {
  return page
    .getByRole("list", { name: "Player order" })
    .getByRole("listitem")
    .filter({ hasText: name });
}

test("your own badge never shows you away when you open the game", async ({ browser, request }) => {
  const [seatOne = ""] = await startTestRoom(request, { players: 2 });
  const one = await openSeat(await browser.newContext(), seatOne);
  await expect(orderBadge(one, "Seat 2")).toContainText("away");
  await expect(orderBadge(one, "Seat 1")).not.toContainText("away");
});

test("a player who disconnects is shown as away and back when they rejoin", async ({
  browser,
  request,
}, testInfo) => {
  const [seatOne = "", seatTwo = ""] = await startTestRoom(request, { players: 2 });
  const one = await openSeat(await browser.newContext(), seatOne);
  const twoContext = await browser.newContext();
  const two = await openSeat(twoContext, seatTwo);
  await expect(opponent(one, "Seat 2")).not.toContainText("away");
  await two.close();
  await expect(opponent(one, "Seat 2")).toContainText("away");
  await expectScreenFits(one, "opponent-away", testInfo);
  await openSeat(twoContext, seatTwo);
  await expect(opponent(one, "Seat 2")).not.toContainText("away");
});

test("opening the game in a second tab moves it there, and the first tab can take it back", async ({
  browser,
  request,
}, testInfo) => {
  const [seatOne = ""] = await startTestRoom(request, { players: 2 });
  const context = await browser.newContext();
  const first = await openSeat(context, seatOne);
  const second = await context.newPage();
  await second.goto("/");
  await expect(second.getByRole("heading", TURN_ONE)).toBeVisible();
  const elsewhere = { name: "This game is open in another tab" };
  await expect(first.getByRole("dialog", elsewhere)).toBeVisible();
  await expectScreenFits(first, "game-opened-elsewhere", testInfo);
  await first.getByRole("button", { name: "Play here instead" }).click();
  await expect(first.getByRole("dialog", elsewhere)).toBeHidden();
  await expect(second.getByRole("dialog", elsewhere)).toBeVisible();
});

test("the game goes on after its room restarts mid-game", async ({ browser, request }) => {
  const [seatOne = "", seatTwo = ""] = await startTestRoom(request, { players: 2 });
  const playerOne = await openPlayer(await browser.newContext(), seatOne);
  const playerTwo = await openPlayer(await browser.newContext(), seatTwo);
  const one = playerOne.page;
  const two = playerTwo.page;
  await two.getByRole("button", { name: "End turn" }).click();
  await expect(opponent(one, "Seat 2")).toContainText("done");
  const hand = await handOf(one);
  const restart = await request.post("/api/test-room-restarts", {
    headers: { [TEST_ROOM_SECRET_HEADER]: readLocalTestRoomSecret() },
    data: { code: roomCodeOf(seatOne) },
  });
  expect(restart.status()).toBe(204);
  await expect(one.getByRole("button", { name: "End turn" })).toBeEnabled();
  expect(await handOf(one)).toEqual(hand);
  await one.getByRole("button", { name: "End turn" }).click();
  for (const page of [one, two]) {
    await expect(page.getByRole("heading", { name: "Turn 1 of 40" })).toBeHidden();
  }
  expect(await hiddenCardsSentToOthers([playerOne, playerTwo])).toEqual([]);
});

test("in a four-player room a refresh, a disconnect and a room restart mid-game keep the game going", async ({
  browser,
  request,
}) => {
  const links = await startTestRoom(request, { players: 4 });
  const players = await Promise.all(
    links.map(async (link) => openPlayer(await browser.newContext(), link)),
  );
  const [one, two, three, four] = players.map((player) => player.page);
  if (one === undefined || two === undefined || three === undefined || four === undefined) {
    throw new Error("a four-player test room has four seats");
  }
  const handOfTwo = await handOf(two);
  await two.reload();
  await expect(two.getByRole("heading", TURN_ONE)).toBeVisible();
  expect(await handOf(two)).toEqual(handOfTwo);
  await three.close();
  await expect(opponent(one, "Seat 3")).toContainText("away");
  await four.getByRole("button", { name: "End turn" }).click();
  await expect(opponent(one, "Seat 4")).toContainText("done");
  const restart = await request.post("/api/test-room-restarts", {
    headers: { [TEST_ROOM_SECRET_HEADER]: readLocalTestRoomSecret() },
    data: { code: roomCodeOf(links[0] ?? "") },
  });
  expect(restart.status()).toBe(204);
  const rejoined = await openPlayer(await browser.newContext(), links[2] ?? "");
  await expect(opponent(one, "Seat 3")).not.toContainText("away");
  for (const page of [one, two, rejoined.page]) {
    await page.getByRole("button", { name: "End turn" }).click();
  }
  for (const page of [one, two, rejoined.page, four]) {
    await expect(page.getByRole("heading", TURN_ONE)).toBeHidden();
  }
  const stillOpen = players.filter((player) => player.page !== three);
  expect(await hiddenCardsSentToOthers([...stillOpen, rejoined])).toEqual([]);
});
