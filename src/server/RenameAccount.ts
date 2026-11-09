import type { Identity } from "./room/Identity";

export type RenameAccount = {
  readonly identity: Identity;
  readonly usernameChangedMs: number | null;
};
