import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import type { Result } from "../../shared/Result";
import { countsOn } from "./countsOn";
import { dailyLimitRejection } from "./dailyLimitRejection";
import type { GameStartRejection } from "./GameStartRejection";
import type { LobbyRecord } from "./LobbyRecord";
import type { PlayerOverLimit } from "./PlayerOverLimit";

export function countGameStart(
  record: LobbyRecord,
  players: ReadonlyArray<PlayerId>,
  limits: { readonly now: EpochMs; readonly siteGamesPerDay: number },
): Result<LobbyRecord, GameStartRejection> {
  const overLimit = players.flatMap((playerId): ReadonlyArray<PlayerOverLimit> => {
    const reason = dailyLimitRejection(record, playerId, limits.now);
    return reason === null ? [] : [{ playerId, reason }];
  });
  if (overLimit.length > 0) {
    return { isOk: false, error: { kind: "players_over_limit", players: overLimit } };
  }
  const counts = countsOn(record, limits.now);
  if (counts.siteGameStarts >= limits.siteGamesPerDay) {
    return { isOk: false, error: { kind: "site_game_limit" } };
  }
  const started = players.map((playerId) => {
    const before = counts.players.find((entry) => entry.playerId === playerId);
    return { playerId, actions: before?.actions ?? 0, gameStarts: (before?.gameStarts ?? 0) + 1 };
  });
  const others = counts.players.filter((entry) => !players.includes(entry.playerId));
  return {
    isOk: true,
    value: {
      ...record,
      today: {
        day: counts.day,
        players: [...others, ...started],
        siteGameStarts: counts.siteGameStarts + 1,
        siteChatMessages: counts.siteChatMessages,
        siteEmails: counts.siteEmails,
        siteTutorialStarts: counts.siteTutorialStarts,
      },
    },
  };
}
