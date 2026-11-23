import type { PlayerId } from "../../shared/PlayerId";
import type { PlayerIconChoice } from "../../shared/playerIcons/PlayerIconChoice";
import type { SeatNumber } from "../../shared/SeatNumber";

export type SeatPlayer = {
  readonly seat: SeatNumber;
  readonly playerId: PlayerId;
  readonly name: string;
  readonly icon: PlayerIconChoice;
  readonly stateVersion: number;
  readonly acceptedActionIds: ReadonlyArray<string>;
};
