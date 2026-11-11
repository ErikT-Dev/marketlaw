import * as v from "valibot";
import { PlayerId } from "../../shared/PlayerId";
import type { RecordReadDatabase } from "./RecordReadDatabase";

const USERNAME_ROW = v.object({ id: PlayerId, name: v.string() });

export async function readUsernames(
  db: RecordReadDatabase,
  playerIds: ReadonlyArray<PlayerId>,
): Promise<ReadonlyMap<PlayerId, string>> {
  const asked = [...new Set(playerIds)];
  if (asked.length === 0) {
    return new Map();
  }
  const { results } = await db
    .prepare(`SELECT id, name FROM players WHERE id IN (${asked.map(() => "?").join(", ")})`)
    .bind(...asked)
    .all();
  return new Map(
    results.map((row) => {
      const { id, name } = v.parse(USERNAME_ROW, row);
      return [id, name];
    }),
  );
}
