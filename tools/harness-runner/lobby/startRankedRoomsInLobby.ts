import { movedToRoom } from "../../../src/server/lobby/movedToRoom.ts";
import { RANKED_QUEUE_PLACE } from "../../../src/server/lobby/RANKED_QUEUE_PLACE.ts";
import { newRoomCode } from "../../../src/server/newRoomCode.ts";
import type { RankedStart } from "../../../src/server/queue/RankedStart.ts";
import { NEW_PLAYER_RATING } from "../../../src/server/ratings/NEW_PLAYER_RATING.ts";
import { startedMatchNotices } from "../../../src/server/queue/startedMatchNotices.ts";
import type { RankedPlayer } from "../../../src/server/room/RankedPlayer.ts";
import { startRankedRoomIn } from "../../../src/server/room/startRankedRoomIn.ts";
import type { PlayerId } from "../../../src/shared/PlayerId.ts";
import type { LobbySession } from "./LobbySession.ts";
import { seatOrderDrawn } from "./seatOrderDrawn.ts";

function rankedPlayerOf(session: LobbySession, playerId: PlayerId): ReadonlyArray<RankedPlayer> {
  const account = [...session.accounts.values()].find(
    ({ identity }) => identity.playerId === playerId,
  );
  return account === undefined ? [] : [{ ...account.identity, ...NEW_PLAYER_RATING }];
}

export function startRankedRoomsInLobby(
  session: LobbySession,
  starts: ReadonlyArray<RankedStart>,
): ReturnType<typeof startedMatchNotices> {
  return starts.flatMap((start) => {
    const code = newRoomCode();
    const room = {
      code,
      size: start.size,
      playersInQueueOrder: start.players.flatMap((playerId) => rankedPlayerOf(session, playerId)),
    };
    const gameStart = {
      seed: 1,
      now: session.now,
      seatOrder: (players: ReadonlyArray<PlayerId>) =>
        seatOrderDrawn(session.random, players, (name) => session.identityNamed(name)),
    };
    if (session.record !== null || !startRankedRoomIn(session.storage, room, gameStart)) {
      throw new Error("the lobby driver starts a ranked game only when it holds no room");
    }
    session.lobby = movedToRoom(session.lobby, start.players, RANKED_QUEUE_PLACE, code);
    return startedMatchNotices(start, code);
  });
}
