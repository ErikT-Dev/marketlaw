import * as v from "valibot";
import { PlayerId } from "../shared/PlayerId";
import { newSessionToken } from "./newSessionToken";
import type { Identity } from "./room/Identity";
import { sha256Hex } from "./sha256Hex";

export async function insertGuest(
  env: Env,
  name: string,
  isTestRoomSeat = false,
): Promise<{ readonly token: string; readonly identity: Identity }> {
  const token = newSessionToken();
  const playerId = v.parse(PlayerId, crypto.randomUUID());
  await env.DB.prepare(
    "INSERT INTO players (id, name, token_hash, created_ms, is_test_room_seat) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(playerId, name, await sha256Hex(token), Date.now(), isTestRoomSeat ? 1 : 0)
    .run();
  return { token, identity: { playerId, name } };
}
