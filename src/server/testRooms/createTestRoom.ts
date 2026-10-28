import type { TestRoomResponse } from "../../shared/api/TestRoomResponse";
import { insertGuest } from "../insertGuest";
import { withFreeRoomCode } from "../withFreeRoomCode";
import { hasTestRoomSecret } from "./hasTestRoomSecret";
import { testRoomRequestOf } from "./testRoomRequestOf";

function json(body: TestRoomResponse, status = 200): Response {
  return Response.json(body, { status });
}

export async function createTestRoom(request: Request, env: Env): Promise<Response> {
  if (!(await hasTestRoomSecret(request, env))) {
    return new Response("Not found", { status: 404 });
  }
  const body = testRoomRequestOf(await request.json().catch(() => null));
  if (body === null || body.playerNames.length !== body.state.seats.length) {
    return json({ isOk: false, reason: "malformed_message" }, 400);
  }
  const guests = await Promise.all(
    body.playerNames.map(async (name) => insertGuest(env, name, true)),
  );
  const seed = crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
  const code = await withFreeRoomCode(env, async (room, candidate) =>
    room.startTestRoom(
      candidate,
      seed,
      guests.map(({ identity }) => identity),
      body.state,
    ),
  );
  if (code === null) {
    return json({ isOk: false, reason: "no_free_room_code" }, 503);
  }
  const seats = body.state.seats.flatMap((seat, index) => {
    const guest = guests[index];
    return guest === undefined
      ? []
      : [{ seat: seat.seat, name: guest.identity.name, token: guest.token }];
  });
  return json({ isOk: true, code, seats });
}
