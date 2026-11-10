import type { GameRecord } from "../../shared/records/GameRecord";
import type { RoomGame } from "../room/RoomGame";
import type { RecordPlayer } from "./RecordPlayer";

export type StoredGameRecord = GameRecord & {
  readonly kind: RoomGame["kind"];
  readonly startedMs: number;
  readonly endedMs: number;
  readonly players: ReadonlyArray<RecordPlayer>;
};
