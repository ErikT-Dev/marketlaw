import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import { caughtUpRoom } from "./caughtUpRoom";
import type { Identity } from "./Identity";
import { joinRoom } from "./joinRoom";
import type { JoinRejection } from "./JoinRejection";
import { loadRoom } from "./loadRoom";
import type { RoomStorage } from "./RoomStorage";

export function joinRejectionIn(
  storage: RoomStorage,
  joining: Identity,
  now: EpochMs,
  livePlayers: ReadonlyArray<PlayerId>,
): JoinRejection | null {
  const stored = loadRoom(storage);
  const record = stored === null ? null : caughtUpRoom(stored, now, livePlayers).record;
  if (record === null) {
    return { reason: "room_not_found", rejoinAt: null };
  }
  const joined = joinRoom(record, joining, now);
  return joined.isOk ? null : joined.error;
}
