import type { Identity } from "./room/Identity";

export type RenameAccount = {
  readonly identity: Identity;
  readonly usernameChangesMs: ReadonlyArray<number>;
};
