import type { ChangeLimit } from "./ChangeLimit";

const HOURS_IN_WAIT = 24;
const MS_PER_HOUR = 3_600_000;

export const ICON_CHANGE_LIMIT: ChangeLimit = {
  count: 10,
  waitMs: HOURS_IN_WAIT * MS_PER_HOUR,
};
