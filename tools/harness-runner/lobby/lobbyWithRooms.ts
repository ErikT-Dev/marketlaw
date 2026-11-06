import type { LobbyRecord } from "../../../src/server/lobby/LobbyRecord.ts";
import { withRoomSummary } from "../../../src/server/lobby/withRoomSummary.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import { roomSummaryOf } from "../../../src/server/room/roomSummaryOf.ts";

export function lobbyWithRooms(
  lobby: LobbyRecord,
  maybeRooms: ReadonlyArray<RoomRecord | null>,
): LobbyRecord {
  const rooms = maybeRooms.flatMap((room) => (room === null ? [] : [room]));
  const gone = lobby.rooms.filter(({ code }) => !rooms.some((room) => room.code === code));
  let reported = lobby;
  for (const { code } of gone) {
    reported = withRoomSummary(reported, code, null);
  }
  for (const room of rooms) {
    const summary = roomSummaryOf(room);
    const listed = reported.rooms.find(({ code }) => code === room.code);
    if (JSON.stringify(listed) !== JSON.stringify(summary)) {
      reported = withRoomSummary(reported, room.code, summary);
    }
  }
  return reported;
}
