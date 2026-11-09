import type { Identity } from "../../../src/server/room/Identity.ts";
import type { LobbyRegistration } from "./LobbyRegistration.ts";

export type LobbyAccount = {
  readonly identity: Identity;
  readonly lastUsedMs: number;
  readonly registration: LobbyRegistration | null;
  readonly usernameChangedMs: number | null;
};
