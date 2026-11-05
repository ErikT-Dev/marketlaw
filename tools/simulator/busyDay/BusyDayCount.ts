import type { BusyDayRows } from "./BusyDayRows.ts";

export type BusyDayCount = {
  readonly written: BusyDayRows;
  readonly rowsRead: number;
};
