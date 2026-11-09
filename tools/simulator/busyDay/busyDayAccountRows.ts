import { BUSY_DAY_ACCOUNT_ACTIONS } from "./BUSY_DAY_ACCOUNT_ACTIONS.ts";

export function busyDayAccountRows(): number {
  return Object.values(BUSY_DAY_ACCOUNT_ACTIONS).reduce(
    (rows, { perDay, rowsWritten }) => rows + perDay * rowsWritten,
    0,
  );
}
