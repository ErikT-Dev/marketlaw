import type { RoomCode } from "../../shared/RoomCode";
import type { RoomPlayer } from "./RoomPlayer";

export type RoomSummary = {
  readonly code: RoomCode;
  readonly size: 2 | 3 | 4;
  readonly isPublic: boolean;
  readonly isWaiting: boolean;
  readonly isOver: boolean;
  readonly players: ReadonlyArray<RoomPlayer>;
};
