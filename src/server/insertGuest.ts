import * as v from "valibot";
import { PlayerId } from "../shared/PlayerId";
import { nameKeyOf } from "./accounts/nameKeyOf";
import { newSessionToken } from "./newSessionToken";
import type { Identity } from "./room/Identity";
import { sha256Hex } from "./sha256Hex";

export async function insertGuest(
  env: Env,
  name: string,
  isTestRoomSeat = false,
): Promise<{ readonly token: string; readonly identity: Identity } | null> {
  const token = newSessionToken();
  const playerId = v.parse(PlayerId, crypto.randomUUID());
  const now = Date.now();
  const [account] = await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO players (id, name, name_key, created_ms, is_test_room_seat) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING",
    ).bind(playerId, name, isTestRoomSeat ? null : nameKeyOf(name), now, isTestRoomSeat ? 1 : 0),
    env.DB.prepare(
      "INSERT INTO logins (token_hash, player_id, created_ms, last_used_ms) SELECT ?, id, ?, ? FROM players WHERE id = ?",
    ).bind(await sha256Hex(token), now, now, playerId),
  ]);
  return account?.meta.changes === 1 ? { token, identity: { playerId, name } } : null;
}
