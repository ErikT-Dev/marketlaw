import { movedToRoom } from "../../../src/server/lobby/movedToRoom.ts";
import { RANKED_QUEUE_PLACE } from "../../../src/server/lobby/RANKED_QUEUE_PLACE.ts";
import type { RankedStart } from "../../../src/server/queue/RankedStart.ts";
import { NEW_PLAYER_RATING } from "../../../src/server/ratings/NEW_PLAYER_RATING.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";
import { startRankedRoomIn } from "../../../src/server/room/startRankedRoomIn.ts";
import type { EpochMs } from "../../../src/shared/EpochMs.ts";
import type { RoomCode } from "../../../src/shared/RoomCode.ts";
import { gameStartInJoinOrder } from "../gameStartInJoinOrder.ts";
import type { BusyDayCounter } from "./BusyDayCounter.ts";

export function startBusyDayRankedRoom(
  counter: BusyDayCounter,
  room: {
    readonly code: RoomCode;
    readonly start: RankedStart;
    readonly players: ReadonlyArray<Identity>;
    readonly now: EpochMs;
  },
): void {
  const { code, start } = room;
  const playersInQueueOrder = start.players.flatMap((playerId) =>
    room.players
      .filter((seated) => seated.playerId === playerId)
      .map((seated) => ({ ...seated, ...NEW_PLAYER_RATING })),
  );
  counter.newRoom();
  counter.countReads(start.size);
  startRankedRoomIn(
    counter.storage,
    { code, size: start.size, playersInQueueOrder },
    gameStartInJoinOrder(1, room.now),
  );
  counter.changeLobby(movedToRoom(counter.lobby, start.players, RANKED_QUEUE_PLACE, code));
}
