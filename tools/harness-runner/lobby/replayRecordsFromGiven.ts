import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";
import type { LobbyReplayRecord } from "./LobbyReplayRecord.ts";

export function replayRecordsFromGiven(given: LobbyGiven): ReadonlyArray<LobbyReplayRecord> {
  return given.room?.state === "ended"
    ? [{ code: given.room.code, endedMs: given.room.ended_ms ?? 0 }]
    : [];
}
