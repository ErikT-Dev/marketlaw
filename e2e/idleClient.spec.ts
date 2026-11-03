import { expect, test } from "@playwright/test";
import { DUMMY_HUMAN_CHECK } from "./DUMMY_HUMAN_CHECK";
import { uniqueName } from "./uniqueName";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

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
  page.on("websocket", (socket) => {
    socket.on("framesent", (frame) => {
      sentFrames.push(String(frame.payload));
    });
  });
  await page.goto("/");
  await expect(page.getByRole("list", { name: "Players in the room" })).toBeVisible();
  const sentWhileConnecting = sentFrames.length;
  await page.clock.runFor(FIVE_MINUTES_MS);
  expect(sentWhileConnecting).toBe(1);
  expect(sentFrames).toHaveLength(sentWhileConnecting);
});
