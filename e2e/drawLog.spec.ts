import { expect, test, type Page } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { hiddenCardsSentToOthers } from "./hiddenCardsSentToOthers";
import { startGame } from "./startGame";

const DRAW_LOG = [
  {
    kind: "draw",
    turn: 1,
    seat: 2,
    cause: "income",
    count: 1,
    asked: { by: "sector", sector: "Service", tier: 1 },
  },
  {
    kind: "shuffle",
    turn: 1,
    seat: 1,
    asked: { by: "kind", kind: "Public quality card", tier: 1 },
    count: 4,
  },
  {
    kind: "draw",
    turn: 1,
    seat: 1,
    cause: "income",
    count: 1,
    asked: { by: "kind", kind: "Public quality card", tier: 1 },
  },
];

const SEAT_NAMES = ["Ann", "Bea"];

function fieldOf(value: unknown, field: string): unknown {
  return typeof value === "object" && value !== null && field in value
    ? Object.getOwnPropertyDescriptor(value, field)?.value
    : undefined;
}

function withDrawLog(text: string): string {
  const message: unknown = JSON.parse(text);
  const update = fieldOf(message, "update");
  const view = fieldOf(fieldOf(update, "game"), "view");
  const room = fieldOf(update, "room");
  if (typeof view === "object" && view !== null && typeof room === "object" && room !== null) {
    Object.assign(view, { drawLog: DRAW_LOG });
    Object.assign(room, { playerNames: SEAT_NAMES });
  }
  return JSON.stringify(message);
}

async function addDrawLogToUpdates(page: Page | undefined): Promise<void> {
  if (page === undefined) {
    return;
  }
  await page.routeWebSocket(/\/api\/rooms\/[A-Z0-9]+\/socket$/, (socket) => {
    const server = socket.connectToServer();
    server.onMessage((message) => {
      socket.send(withDrawLog(String(message)));
    });
  });
}

test("the draw log sent by the room is listed newest first and fits the screen", async ({
  browser,
  viewport,
}, testInfo) => {
  const size = viewport ?? { width: 1920, height: 1080 };
  const [ann, bea] = await startGame(browser, size, ["Ann", "Bea"], async ([first]) => {
    await addDrawLogToUpdates(first?.page);
  });
  if (ann === undefined || bea === undefined) {
    throw new Error("no players");
  }
  const entries = ann.page
    .getByRole("tabpanel", { name: "Draw log" })
    .getByRole("list", { name: "Draw log entries" })
    .getByRole("listitem");
  await expect(entries).toHaveText([
    "T1Turn 1: Ann drew 1 card: Public quality, tier 1 (Income)",
    "T1Turn 1: Discard shuffle: 4 Public quality, tier 1 cards went into the deck",
    "T1Turn 1: Bea drew 1 card: Service, tier 1 (Income)",
  ]);
  await expectScreenFits(ann.page, "draw-log", testInfo);
  expect(await hiddenCardsSentToOthers([ann, bea])).toEqual([]);
  await Promise.all([ann, bea].map(async (player) => player.page.context().close()));
});
