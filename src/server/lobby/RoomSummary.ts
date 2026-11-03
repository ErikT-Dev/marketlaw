import type { PlayerId } from "../../shared/PlayerId";
import type { RoomCode } from "../../shared/RoomCode";

export type RoomSummary = {
  readonly code: RoomCode;
  readonly size: 2 | 3 | 4;
  readonly isPublic: boolean;
  readonly isWaiting: boolean;
  readonly isOver: boolean;
  readonly players: ReadonlyArray<{ readonly playerId: PlayerId; readonly name: string }>;
};
