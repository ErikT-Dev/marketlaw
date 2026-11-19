import { pathToFileURL } from "node:url";
import type { APIRequestContext } from "@playwright/test";
import * as v from "valibot";
import { TEST_ROOM_SECRET_HEADER } from "../src/shared/api/TEST_ROOM_SECRET_HEADER";
import { TestRoomResponse } from "../src/shared/api/TestRoomResponse";
import { bundleForNode } from "../tools/bundleForNode";
import { readLocalTestRoomSecret } from "../tools/test-room/readLocalTestRoomSecret";

const BUNDLED_MODULE = v.object({ testRoomRequestOf: v.function() });
const TEST_ROOM_REQUEST = v.object({ state: v.unknown(), playerNames: v.array(v.string()) });

let bundledTestRoomRequestOf: Promise<(given: unknown) => unknown> | undefined;

async function loadTestRoomRequestOf(): Promise<(given: unknown) => unknown> {
  const bundle = await bundleForNode(
    "e2e/testRoomRequestOf.ts",
    `testRoomRequestOf-${String(process.pid)}`,
  );
  const loaded: unknown = await import(pathToFileURL(bundle).href);
  return v.parse(BUNDLED_MODULE, loaded).testRoomRequestOf;
}

export async function startTestRoom(
  request: APIRequestContext,
  given: Readonly<Record<string, unknown>>,
): Promise<ReadonlyArray<string>> {
  bundledTestRoomRequestOf ??= loadTestRoomRequestOf();
  const testRoomRequestOf = await bundledTestRoomRequestOf;
  const data = v.parse(TEST_ROOM_REQUEST, testRoomRequestOf(given));
  const response = await request.post("/api/test-rooms", {
    headers: { [TEST_ROOM_SECRET_HEADER]: readLocalTestRoomSecret() },
    data,
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
