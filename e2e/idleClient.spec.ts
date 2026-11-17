import { expect, test } from "@playwright/test";
import { DUMMY_HUMAN_CHECK } from "./DUMMY_HUMAN_CHECK";
import { uniqueName } from "./uniqueName";

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const LOBBY_SOCKET_PATH = "/api/lobby/socket";

function textField(value: unknown, field: string): string {
  const found: unknown =
    typeof value === "object" && value !== null && field in value
      ? Object.getOwnPropertyDescriptor(value, field)?.value
      : undefined;
  return typeof found === "string" ? found : "";
}

test("an idle connected client sends no messages for five minutes", async ({ page }) => {
  await page.clock.install();
  const name = uniqueName("Idle");
  const guest: unknown = await (
    await page.request.post("/api/guests", { data: { name, humanCheck: DUMMY_HUMAN_CHECK } })
  ).json();
  const token = textField(guest, "token");
  const room: unknown = await (
    await page.request.post("/api/rooms", {
      data: { token, size: 4, isPublic: false, humanCheck: DUMMY_HUMAN_CHECK },
    })
  ).json();
  const session = { token, name, roomCode: textField(room, "code") };
  await page.addInitScript((stored) => {
    localStorage.setItem("marketlaw.session", stored);
  }, JSON.stringify(session));
  const sentFrames: string[] = [];
  const lobbySocketFrames: string[] = [];
  page.on("websocket", (socket) => {
    socket.on("framesent", (frame) => {
      const payload = String(frame.payload);
      sentFrames.push(payload);
      if (socket.url().endsWith(LOBBY_SOCKET_PATH)) {
        lobbySocketFrames.push(payload);
      }
    });
  });
  await page.goto("/");
  await expect(page.getByRole("list", { name: "Players in the room" })).toBeVisible();
  await expect.poll(() => lobbySocketFrames.length).toBe(1);
  const sentWhileConnecting = sentFrames.length;
  await page.clock.runFor(FIVE_MINUTES_MS);
  expect(sentWhileConnecting).toBe(2);
  expect(textField(JSON.parse(lobbySocketFrames[0] ?? "{}"), "type")).toBe("identify");
  expect(sentFrames).toHaveLength(sentWhileConnecting);
});
