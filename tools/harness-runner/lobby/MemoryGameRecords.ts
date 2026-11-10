import type { GameRecordDatabase } from "../../../src/server/records/GameRecordDatabase.ts";

export type MemoryGameRecords = {
  readonly database: GameRecordDatabase;
  readonly rowCounts: () => Readonly<Record<"records" | "players", number>>;
};
