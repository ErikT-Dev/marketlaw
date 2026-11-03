import { expect, test } from "@playwright/test";
import { TEST_ROOM_SECRET_HEADER } from "../src/shared/api/TEST_ROOM_SECRET_HEADER";
import { readLocalTestRoomSecret } from "../tools/test-room/readLocalTestRoomSecret";
import { startTestRoom } from "./startTestRoom";

function roomCodeOf(link: string): string {
  return new URLSearchParams(link.split("#")[1] ?? "").get("room") ?? "";
}

test("a running room's replay record is exported only with the secret", async ({ request }) => {
  const [seatOne = ""] = await startTestRoom(request, { players: 2 });
  const path = `/api/rooms/${roomCodeOf(seatOne)}/replay`;
  expect((await request.get(path)).status()).toBe(404);
  const wrong = await request.get(path, {
    headers: { [TEST_ROOM_SECRET_HEADER]: "not-the-secret-of-this-server" },
  });
  expect(wrong.status()).toBe(404);
  const exported = await request.get(path, {
    headers: { [TEST_ROOM_SECRET_HEADER]: readLocalTestRoomSecret() },
  });
  expect(exported.status()).toBe(200);
  expect(await exported.json()).toMatchObject({
    setup: { players: 2 },
    actionLog: [],
    startingState: { turn: 1, phase: "main" },
  });
});

test("an unknown room has no replay record", async ({ request }) => {
  const exported = await request.get("/api/rooms/ZZZZZZ/replay", {
    headers: { [TEST_ROOM_SECRET_HEADER]: readLocalTestRoomSecret() },
  });
  expect(exported.status()).toBe(404);
});
