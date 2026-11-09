import type { FailedLogins } from "./accounts/FailedLogins";
import type { Identity } from "./room/Identity";

export type LoginAccount = {
  readonly identity: Identity;
  readonly passwordHash: string;
  readonly failedLogins: FailedLogins;
};
