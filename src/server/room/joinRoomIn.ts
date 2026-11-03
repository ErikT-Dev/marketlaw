import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import { caughtUpRoom } from "./caughtUpRoom";
import type { Identity } from "./Identity";
import { joinRoom } from "./joinRoom";
import type { JoinRejection } from "./JoinRejection";
import { loadRoom } from "./loadRoom";
import type { RoomRemoval } from "./RoomRemoval";
import type { RoomStorage } from "./RoomStorage";

type JoinOutcome = {
  readonly rejection: JoinRejection | null;
  readonly removals: ReadonlyArray<RoomRemoval>;
};

const NOT_FOUND: JoinOutcome = {
  rejection: { reason: "room_not_found", rejoinAt: null },
  removals: [],
};

export function joinRoomIn(
  storage: RoomStorage,
  joining: Identity,
  now: EpochMs,
  livePlayers: ReadonlyArray<PlayerId>,
): JoinOutcome {
  const stored = loadRoom(storage);
  if (stored === null) {
    return NOT_FOUND;
  }
  const { record, removals } = caughtUpRoom(stored, now, livePlayers);
  if (record === null) {
    storage.remove();
    return { ...NOT_FOUND, removals };
  }
  const joined = joinRoom(record, joining, now);
  const next = joined.isOk ? joined.value : record;
  if (next !== stored) {
    storage.write(next);
  }
  return { rejection: joined.isOk ? null : joined.error, removals };
}
