import { expect, test, type Browser, type Page, type ViewportSize } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { startTestRoom } from "./startTestRoom";

const ROOM_SOCKET = /\/api\/rooms\/[^/]+\/socket$/;
const TURN_ONE = { name: "Turn 1 of 40" };

async function newSeatPage(browser: Browser, viewport: ViewportSize | null): Promise<Page> {
  const context = await browser.newContext({ viewport: viewport ?? { width: 1920, height: 1080 } });
  return context.newPage();
}

function withOldProtocolVersion(message: string | Buffer): string | Buffer {
  if (typeof message !== "string") {
    return message;
  }
  const parsed: unknown = JSON.parse(message);
  return typeof parsed === "object" && parsed !== null
    ? JSON.stringify({ ...parsed, protocolVersion: 0 })
    : message;
}

test("a lost connection says the game is reconnecting and that the clock keeps running", async ({
  browser,
  request,
  viewport,
}, testInfo) => {
  const [seatOne = ""] = await startTestRoom(request, { players: 2 });
  const page = await newSeatPage(browser, viewport);
  let isServerReachable = true;
  const openSockets: Array<{ close: () => Promise<void> }> = [];
  await page.routeWebSocket(ROOM_SOCKET, (socket) => {
    if (!isServerReachable) {
      void socket.close();
      return;
    }
    const server = socket.connectToServer();
    openSockets.push(socket, server);
  });
  await page.goto(seatOne);
  await expect(page.getByRole("heading", TURN_ONE)).toBeVisible();

  isServerReachable = false;
  await Promise.all(openSockets.map(async (socket) => socket.close()));
  await expect(page.getByRole("status").filter({ hasText: "Connection lost" })).toHaveText(
    "Connection lost. Reconnecting… Your clock keeps running; other players see you as away.",
  );
  await expectScreenFits(page, "connection-lost", testInfo);
  await page.context().close();
});

test("a tab running an old version is asked to reload", async ({
  browser,
  request,
  viewport,
}, testInfo) => {
  const [seatOne = ""] = await startTestRoom(request, { players: 2 });
  const page = await newSeatPage(browser, viewport);
  let isClientOutdated = false;
  await page.routeWebSocket(ROOM_SOCKET, (socket) => {
    const server = socket.connectToServer();
    socket.onMessage((message) => {
      server.send(isClientOutdated ? withOldProtocolVersion(message) : message);
    });
  });
  await page.goto(seatOne);
  await expect(page.getByRole("heading", TURN_ONE)).toBeVisible();

  isClientOutdated = true;
  await page.getByRole("button", { name: /^Redraw hand/ }).click();
  const notice = page.getByRole("dialog", { name: "A new version is available" });
  await expect(notice).toContainText("Reload the page to keep playing");
  await expect(notice.getByRole("button", { name: "Reload" })).toBeVisible();
  await expectScreenFits(page, "new-version", testInfo);
  await page.context().close();
});
