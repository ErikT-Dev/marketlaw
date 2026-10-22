import type { PressHistory } from "../shared/PressHistory";
import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";

const RECENT_PRESS_LIMIT = 5;

type PressLogRow = { press_number: number; pressed_at: number };

export async function readPressHistory(database: D1Database): Promise<PressHistory> {
  const { results } = await database
    .prepare("SELECT press_number, pressed_at FROM press_log ORDER BY press_number DESC LIMIT ?")
    .bind(RECENT_PRESS_LIMIT)
    .all<PressLogRow>();
  return {
    protocolVersion: PROTOCOL_VERSION,
    recentPresses: results.map((row) => ({ pressNumber: row.press_number, pressedAtEpochMs: row.pressed_at })),
  };
}
