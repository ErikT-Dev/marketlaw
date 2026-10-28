import { sha256Hex } from "../sha256Hex";

export async function isTestRoomSeat(db: D1Database, token: string): Promise<boolean> {
  const row = await db
    .prepare("SELECT 1 AS found FROM players WHERE token_hash = ? AND is_test_room_seat = 1")
    .bind(await sha256Hex(token))
    .first();
  return row !== null;
}
