import type { RecentPress } from "../shared/RecentPress";

export async function recordPressInHistory(database: D1Database, press: RecentPress): Promise<void> {
  await database
    .prepare("INSERT OR IGNORE INTO press_log (press_number, pressed_at) VALUES (?, ?)")
    .bind(press.pressNumber, press.pressedAtEpochMs)
    .run();
}
