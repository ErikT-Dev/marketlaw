import type { Identity } from "../../../src/server/room/Identity.ts";

export type LobbyAccount = {
  readonly identity: Identity;
  readonly kind: "guest";
  readonly lastUsedMs: number;
};
