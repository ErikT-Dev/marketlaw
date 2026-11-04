import type { Identity } from "../../../src/server/room/Identity.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import type { EpochMs } from "../../../src/shared/EpochMs.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";
import { lobbyRoomFromGiven } from "./lobbyRoomFromGiven.ts";

export function endedRoomFromGiven(
  given: LobbyGiven,
  identityNamed: (name: string) => Identity,
  now: EpochMs,
): RoomRecord | null {
  return given.room?.state === "ended" ? lobbyRoomFromGiven(given.room, identityNamed, now) : null;
}
