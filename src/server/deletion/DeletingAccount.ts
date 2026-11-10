import type { Identity } from "../room/Identity";

export type DeletingAccount = {
  readonly identity: Identity;
  readonly passwordHash: string | null;
  readonly isGuest: boolean;
};
