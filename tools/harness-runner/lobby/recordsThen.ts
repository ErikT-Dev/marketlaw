import type { LobbyRanking } from "./LobbyRanking.ts";
import type { LobbySession } from "./LobbySession.ts";
import { matchHistoryThen } from "./matchHistoryThen.ts";

function rankingThen(ranking: LobbyRanking) {
  return (
    ranking.opened?.entries.map(({ place, username, rating, rankedGames }) => ({
      place,
      username,
      rating,
      ranked_games: rankedGames,
    })) ?? "no ranking opened"
  );
}

function rankingPageThen(ranking: LobbyRanking) {
  const opened = ranking.opened;
  if (opened === null) {
    return "no ranking opened";
  }
  const shown = opened.entries.find(({ username }) => username === ranking.viewerName);
  return {
    page: opened.page,
    first_place: opened.entries[0]?.place ?? null,
    last_place: opened.entries.at(-1)?.place ?? null,
    shows: shown?.username ?? null,
  };
}

export async function recordsThen(session: LobbySession, ranking: LobbyRanking, field: string) {
  switch (field) {
    case "match_history":
      return matchHistoryThen(session.history.opened);
    case "record_usernames":
      return session.history.accountGameUsernames(session.accounts);
    case "ranking":
      return rankingThen(ranking);
    default:
      return rankingPageThen(ranking);
  }
}
