import { epochMsAfter } from "../../rules/epochMsAfter";
import type { EpochMs } from "../../shared/EpochMs";
import type { RoomChange } from "./RoomChange";
import type { RoomRecord } from "./RoomRecord";
import type { RoomRemoval } from "./RoomRemoval";
import { ROOM_TIMES } from "./ROOM_TIMES";
import { roomWithout } from "./roomWithout";

function disconnectRemovals(record: RoomRecord, now: EpochMs): ReadonlyArray<RoomRemoval> {
  return record.waiting.disconnected
    .filter(({ since }) => since + ROOM_TIMES.waitingDisconnectMs <= now)
    .map(({ playerId }) => ({ playerId, reason: "disconnected", rejoinAt: null }));
}

function timeOutRemovals(record: RoomRecord, now: EpochMs): ReadonlyArray<RoomRemoval> {
  const { asking } = record.waiting;
  if (asking === null || asking.deadline > now) {
    return [];
  }
  const rejoinAt = epochMsAfter(asking.deadline, ROOM_TIMES.rejoinWaitMs);
  return record.players
    .filter(({ playerId }) => !asking.accepted.includes(playerId))
    .map(({ playerId }) => ({ playerId, reason: "timed_out", rejoinAt }));
}

function withoutRemoved(
  record: RoomRecord,
  removals: ReadonlyArray<RoomRemoval>,
): RoomRecord | null {
  if (removals.length === 0) {
    return record;
  }
  const remaining = roomWithout(
    record,
    removals.map(({ playerId }) => playerId),
  );
  const blocks = removals.flatMap(({ playerId, rejoinAt }) =>
    rejoinAt === null ? [] : [{ playerId, until: rejoinAt }],
  );
  return remaining === null
    ? null
    : {
        ...remaining,
        waiting: {
          ...remaining.waiting,
          rejoinBlocks: [...remaining.waiting.rejoinBlocks, ...blocks],
        },
      };
}

export function waitingAlarm(record: RoomRecord, now: EpochMs): RoomChange {
  if (record.game !== null) {
    return { record, removals: [] };
  }
  const disconnected = disconnectRemovals(record, now);
  const afterDisconnects = withoutRemoved(record, disconnected);
  const timedOut = afterDisconnects === null ? [] : timeOutRemovals(afterDisconnects, now);
  const remaining = afterDisconnects === null ? null : withoutRemoved(afterDisconnects, timedOut);
  const removals = [...disconnected, ...timedOut];
  return { record: removals.length === 0 ? record : remaining, removals };
}
