import type { PlayerIconChoice } from "../../shared/playerIcons/PlayerIconChoice";

export type IconChange = {
  readonly current: PlayerIconChoice;
  readonly wanted: {
    readonly picture: string;
    readonly background: string;
    readonly color: string;
  };
  readonly changesMs: ReadonlyArray<number>;
  readonly now: number;
};
