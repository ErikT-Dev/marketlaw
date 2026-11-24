import type { PlayerIconChoice } from "../../../src/shared/playerIcons/PlayerIconChoice.ts";

export type AccountChanges = {
  readonly usernameChangesMs: ReadonlyArray<number>;
  readonly iconChangesMs: ReadonlyArray<number>;
  readonly icon: PlayerIconChoice | null;
};
