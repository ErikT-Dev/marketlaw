import type { RoomCode } from "../../shared/RoomCode";
import type { Identity } from "./Identity";
import type { RoomGame } from "./RoomGame";
import type { RoomWaiting } from "./RoomWaiting";

export type RoomRecord = {
  readonly schemaVersion: number;
  readonly code: RoomCode;
  readonly size: 2 | 3 | 4;
  readonly isPublic: boolean;
  readonly players: ReadonlyArray<Identity>;
  readonly waiting: RoomWaiting;
  readonly game: RoomGame | null;
};
