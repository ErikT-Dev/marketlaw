import type { BusyDayRows } from "./BusyDayRows.ts";

export function busyDayTotal(rows: BusyDayRows): number {
  return rows.room + rows.alarm + rows.lobby + rows.database;
}
