import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import type { Result } from "../../shared/Result";
import type { ClaimRejection } from "./ClaimRejection";
import { dailyLimitRejection } from "./dailyLimitRejection";
import type { BusyPlace } from "./BusyPlace";
import type { LobbyRecord } from "./LobbyRecord";

export function claimPlayer(
  record: LobbyRecord,
  playerId: PlayerId,
  code: BusyPlace,
  now: EpochMs,
): Result<LobbyRecord, ClaimRejection> {
  const current = record.busy.find((entry) => entry.playerId === playerId);
  if (current !== undefined) {
    return current.code === code
      ? { isOk: true, value: record }
      : { isOk: false, error: "busy_elsewhere" };
  }
  const overLimit = dailyLimitRejection(record, playerId, now);
  if (overLimit !== null) {
    return { isOk: false, error: overLimit };
  }
  return { isOk: true, value: { ...record, busy: [...record.busy, { playerId, code }] } };
}
