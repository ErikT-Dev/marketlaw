import * as v from "valibot";
import { GameId } from "../../shared/GameId";
import { endedGameOf } from "../replays/endedGameOf";
import type { RoomRecord } from "../room/RoomRecord";
import { saveGameRecord } from "./saveGameRecord";
import { storedGameRecordOf } from "./storedGameRecordOf";

export async function saveGameRecordIfEnded(
  db: D1Database,
  before: RoomRecord | null,
  after: RoomRecord,
): Promise<void> {
  const { game } = after;
  const record =
    endedGameOf(before, after) === null || game === null ? null : storedGameRecordOf(game);
  if (record !== null) {
    await saveGameRecord(db, v.parse(GameId, crypto.randomUUID()), record).catch(
      (error: unknown) => {
        console.error("Saving the game record failed", after.code, error);
      },
    );
  }
}
