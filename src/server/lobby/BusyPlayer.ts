import type { PlayerId } from "../../shared/PlayerId";
import type { RoomCode } from "../../shared/RoomCode";

export type BusyPlayer = {
  readonly playerId: PlayerId;
  readonly code: RoomCode;
};
