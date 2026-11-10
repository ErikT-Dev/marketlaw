import type { RecordReadDatabase } from "../../../src/server/records/RecordReadDatabase.ts";
import type { GameRecordDatabase } from "../../../src/server/records/GameRecordDatabase.ts";

export type MemoryGameRecords = {
  readonly database: GameRecordDatabase;
  readonly reader: RecordReadDatabase;
  readonly rowCounts: () => Readonly<Record<"records" | "players", number>>;
};
