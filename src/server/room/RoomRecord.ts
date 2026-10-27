import type { RoomCode } from "../../shared/RoomCode";
import type { Identity } from "./Identity";
import type { RoomGame } from "./RoomGame";

export type RoomRecord = {
  readonly schemaVersion: number;
  readonly code: RoomCode;
  readonly size: 2 | 3 | 4;
  readonly players: ReadonlyArray<Identity>;
  readonly game: RoomGame | null;
};
