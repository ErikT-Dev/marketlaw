import { countGameStart } from "../../../src/server/lobby/countGameStart.ts";
import type { GameStartRejection } from "../../../src/server/lobby/GameStartRejection.ts";
import { siteGameLimitOf } from "../../../src/server/lobby/siteGameLimitOf.ts";
import type { PlayerId } from "../../../src/shared/PlayerId.ts";
import type { LobbySession } from "./LobbySession.ts";

export function countGameStartInLobby(
  session: LobbySession,
  players: ReadonlyArray<PlayerId>,
): GameStartRejection | null {
  const limits = { now: session.now, siteGamesPerDay: siteGameLimitOf({}) };
  const counted = countGameStart(session.lobby, players, limits);
  session.lobby = counted.isOk ? counted.value : session.lobby;
  return counted.isOk ? null : counted.error;
}
