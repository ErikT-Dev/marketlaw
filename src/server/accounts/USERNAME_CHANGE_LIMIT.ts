import type { ChangeLimit } from "./ChangeLimit";
import { USERNAME_CHANGE_WAIT_MS } from "./USERNAME_CHANGE_WAIT_MS";
import { USERNAME_CHANGES_IN_WAIT } from "./USERNAME_CHANGES_IN_WAIT";

export const USERNAME_CHANGE_LIMIT: ChangeLimit = {
  count: USERNAME_CHANGES_IN_WAIT,
  waitMs: USERNAME_CHANGE_WAIT_MS,
};
