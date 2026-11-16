import { countsOn } from "../lobby/countsOn";
import type { LobbyRecord } from "../lobby/LobbyRecord";
import type { QueueContext } from "./QueueContext";

export function isSiteGameLimitReached(lobby: LobbyRecord, context: QueueContext): boolean {
  return countsOn(lobby, context.now).siteGameStarts >= context.siteGamesPerDay;
}
