import { expect, test } from "@playwright/test";
import { becomeGuest } from "./becomeGuest";
import { createRoomAs } from "./createRoomAs";
import { DUMMY_HUMAN_CHECK } from "./DUMMY_HUMAN_CHECK";
import { expectScreenFits } from "./expectScreenFits";
import { PROTOCOL_VERSION } from "../src/shared/PROTOCOL_VERSION";
import { openLobby } from "./openLobby";
import { SIGNING_IN_TEST_MS } from "./SIGNING_IN_TEST_MS";
import { uniqueName } from "./uniqueName";

function textField(value: unknown, field: string): string {
  const found: unknown =
    typeof value === "object" && value !== null && field in value
      ? Object.getOwnPropertyDescriptor(value, field)?.value
      : undefined;
  return typeof found === "string" ? found : "";
}

test("a public room appears in the lobby and is joined with one click", async ({
  browser,
  viewport,
}, testInfo) => {
  test.setTimeout(SIGNING_IN_TEST_MS);
  const size = viewport ?? { width: 1920, height: 1080 };
  const host = await openLobby(browser, "Clever Canal Planner", size);
  const visitor = await openLobby(browser, "Bea", size);
  const code = await createRoomAs(host, 3);
  const listed = visitor.page.getByRole("listitem", { name: `${host.name}'s room` });
  await expect(listed).toContainText("1 of 3 players · 2 free");
  await expectScreenFits(visitor.page, "lobby", testInfo);
  await listed.getByRole("button", { name: "Join" }).click();
  await becomeGuest(visitor);
  await expect(visitor.page.getByRole("heading", { name: `Room ${code}` })).toBeVisible();
  await expect(host.page.getByRole("list", { name: "Players in the room" })).toContainText(
    visitor.name,
  );
  await Promise.all([host, visitor].map(async (player) => player.page.context().close()));
});

test("a player waiting in a room cannot join or create another room", async ({ request }) => {
  async function guest(base: string): Promise<string> {
    const answer: unknown = await (
      await request.post("/api/guests", {
        data: { name: uniqueName(base), humanCheck: DUMMY_HUMAN_CHECK },
      })
    ).json();
    return textField(answer, "token");
  }
  async function newRoom(token: string): Promise<unknown> {
    return (
      await request.post("/api/rooms", {
        data: { token, size: 3, isPublic: true, humanCheck: DUMMY_HUMAN_CHECK },
      })
    ).json();
  }
  const ann = await guest("Ann");
  const cat = await guest("Cat");
  const first = textField(await newRoom(ann), "code");
  const second = textField(await newRoom(cat), "code");
  const joined = await request.post(`/api/rooms/${second}/join`, { data: { token: ann } });
  expect(await joined.json()).toEqual({ isOk: false, reason: "busy_elsewhere", rejoinAt: null });
  expect(await newRoom(ann)).toEqual({ isOk: false, reason: "busy_elsewhere", rejoinAt: null });
  expect(first).toMatch(/^[A-Z0-9]{6}$/);
});

test("the lobby says when there are no public rooms", async ({ page }, testInfo) => {
  await page.routeWebSocket(/\/api\/lobby\/socket$/, (socket) => {
    socket.send(
      JSON.stringify({ type: "lobby", protocolVersion: PROTOCOL_VERSION, publicRooms: [] }),
    );
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Public rooms · 0" })).toBeVisible();
  await expect(page.getByText("No public rooms right now")).toBeVisible();
  await expect(page.getByText("Create one, or join a private room with its code.")).toBeVisible();
  await expectScreenFits(page, "lobby-empty", testInfo);
});
