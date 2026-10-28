import type { APIRequestContext } from "@playwright/test";
import * as v from "valibot";
import { TEST_ROOM_SECRET_HEADER } from "../src/shared/api/TEST_ROOM_SECRET_HEADER";
import { TestRoomResponse } from "../src/shared/api/TestRoomResponse";
import { GIVEN_SCHEMA } from "../tools/harness-runner/engine/GIVEN_SCHEMA";
import { stateFromGiven } from "../tools/harness-runner/engine/stateFromGiven";
import { readLocalTestRoomSecret } from "../tools/test-room/readLocalTestRoomSecret";

export async function startTestRoom(
  request: APIRequestContext,
  given: Readonly<Record<string, unknown>>,
): Promise<ReadonlyArray<string>> {
  const state = stateFromGiven(v.parse(GIVEN_SCHEMA, given));
  const response = await request.post("/api/test-rooms", {
    headers: { [TEST_ROOM_SECRET_HEADER]: readLocalTestRoomSecret() },
    data: { state, playerNames: state.seats.map((seat) => `Seat ${String(seat.seat)}`) },
  });
  const room = v.parse(TestRoomResponse, await response.json());
  if (!room.isOk) {
    throw new Error(`the test room could not be started (${room.reason})`);
  }
  return room.seats.map(
    ({ name, token }) =>
      `/#${new URLSearchParams({ session: token, name, room: room.code }).toString()}`,
  );
}
