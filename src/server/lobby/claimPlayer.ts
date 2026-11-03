import type { PlayerId } from "../../shared/PlayerId";
import type { Result } from "../../shared/Result";
import type { RoomCode } from "../../shared/RoomCode";
import type { LobbyRecord } from "./LobbyRecord";

export function claimPlayer(
  record: LobbyRecord,
  playerId: PlayerId,
  code: RoomCode,
): Result<LobbyRecord, "busy_elsewhere"> {
  const current = record.busy.find((entry) => entry.playerId === playerId);
  if (current !== undefined) {
    return current.code === code
      ? { isOk: true, value: record }
      : { isOk: false, error: "busy_elsewhere" };
  }
  return { isOk: true, value: { ...record, busy: [...record.busy, { playerId, code }] } };
}
