import { expect, test, type Page } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { hiddenCardsSentToOthers } from "./hiddenCardsSentToOthers";
import { signedInPlayer } from "./signedInPlayer";

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

function fieldOf(value: unknown, field: string): unknown {
  return typeof value === "object" && value !== null && field in value
    ? Object.getOwnPropertyDescriptor(value, field)?.value
    : undefined;
}

function withDrawLog(text: string): string {
  const message: unknown = JSON.parse(text);
  const view = fieldOf(fieldOf(fieldOf(message, "update"), "game"), "view");
  if (typeof view === "object" && view !== null) {
    Object.assign(view, { drawLog: DRAW_LOG });
  }
  return JSON.stringify(message);
}

async function addDrawLogToUpdates(page: Page): Promise<void> {
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
  const ann = await signedInPlayer(browser, "Ann", size);
  const bea = await signedInPlayer(browser, "Bea", size);
  await addDrawLogToUpdates(ann.page);
  await ann.page.getByRole("button", { name: "Create room" }).click();
  await expect(ann.page.getByRole("heading", { name: "Waiting for players" })).toBeVisible();
  const code = (await ann.page.getByLabel("Room code").textContent()) ?? "";
  await bea.page.getByLabel("Room code").fill(code);
  await bea.page.getByRole("button", { name: "Join room" }).click();
  const entries = ann.page
    .getByRole("region", { name: "Draw log" })
    .getByRole("list", { name: "Draw log entries" })
    .getByRole("listitem");
  await expect(entries).toHaveText([
    "T1Turn 1: Ann drew 1 card: Public quality, tier 1 (income)",
    "T1Turn 1: Discard shuffle: 4 Public quality, tier 1 cards went into the deck",
    "T1Turn 1: Bea drew 1 card: Service, tier 1 (income)",
  ]);
  await expectScreenFits(ann.page, "draw-log", testInfo);
  expect(await hiddenCardsSentToOthers([ann, bea])).toEqual([]);
  await Promise.all([ann, bea].map(async (player) => player.page.context().close()));
});
