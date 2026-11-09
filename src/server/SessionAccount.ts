import type { Identity } from "./room/Identity";

export type SessionAccount = {
  readonly identity: Identity;
  readonly isGuest: boolean;
};
