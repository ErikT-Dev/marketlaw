import { readMatchHistoryPage } from "../../../src/server/records/readMatchHistoryPage.ts";
import { readStoredGameRecord } from "../../../src/server/records/readStoredGameRecord.ts";
import type { EndedRoomRecords } from "./EndedRoomRecords.ts";

export async function gameRecordThen(ended: EndedRoomRecords): Promise<string> {
  await ended.saved;
  const seats = ended.room?.game?.seats ?? [];
  if (seats.length === 0) {
    return "no ended game";
  }
  const { reader } = ended.games;
  const pages = await Promise.all(
    seats.map(async ({ playerId }) => readMatchHistoryPage(reader, playerId, null)),
  );
  const gameIds = [...new Set(pages.flatMap(({ games }) => games.map(({ gameId }) => gameId)))];
  const [gameId] = gameIds;
  const stored = gameId === undefined ? null : await readStoredGameRecord(reader, gameId);
  const isInEveryHistory = pages.every(({ games }) => games.length === 1);
  return gameIds.length === 1 && isInEveryHistory && stored !== null
    ? "kept"
    : `${String(gameIds.length)} records found in the histories of ${String(seats.length)} seats`;
}
