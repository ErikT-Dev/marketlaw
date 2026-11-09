import type { Identity } from "./room/Identity";

export type LogoutAccount = {
  readonly identity: Identity;
  readonly isGuest: boolean;
};
