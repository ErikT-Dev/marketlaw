import type { RankingStanding } from "../../../shared/api/RankingStanding";

export function rankingStandingText(standing: RankingStanding): string | null {
  switch (standing.kind) {
    case "placed":
      return null;
    case "logged_out":
      return "Log in to find your place in the ranking.";
    case "guest":
      return "You are not in the ranking: it lists registered players who have played at least 1 ranked game. Sign up to play ranked games.";
    case "no_ranked_game":
      return "You are not in the ranking yet: it lists registered players who have played at least 1 ranked game. Join the ranked queue from the lobby.";
  }
}
