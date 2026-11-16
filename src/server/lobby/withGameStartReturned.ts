import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import { dayOf } from "./dayOf";
import type { LobbyRecord } from "./LobbyRecord";

export function withGameStartReturned(
  record: LobbyRecord,
  startedPlayers: ReadonlyArray<PlayerId>,
  countedAt: EpochMs,
): LobbyRecord {
  if (record.today.day !== dayOf(countedAt)) {
    return record;
  }
  const players = record.today.players.map((entry) =>
    startedPlayers.includes(entry.playerId)
      ? { ...entry, gameStarts: Math.max(0, entry.gameStarts - 1) }
      : entry,
  );
  const siteGameStarts = Math.max(0, record.today.siteGameStarts - 1);
  return { ...record, today: { ...record.today, players, siteGameStarts } };
}
