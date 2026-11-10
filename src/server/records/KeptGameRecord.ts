import type { GameId } from "../../shared/GameId";
import type { StoredGameRecord } from "./StoredGameRecord";

export type KeptGameRecord = {
  readonly gameId: GameId;
  readonly record: StoredGameRecord;
};
