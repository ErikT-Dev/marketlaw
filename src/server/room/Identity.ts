import type { PlayerId } from "../../shared/PlayerId";
import type { PlayerIconChoice } from "../../shared/playerIcons/PlayerIconChoice";

export type Identity = {
  readonly playerId: PlayerId;
  readonly name: string;
  readonly icon: PlayerIconChoice;
};
