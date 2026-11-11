import { RESERVED_USERNAME } from "../../../src/server/accounts/RESERVED_USERNAME.ts";
import type { RecordName } from "../../../src/shared/api/RecordName.ts";
import type { MatchHistoryResponse } from "../../../src/shared/api/MatchHistoryResponse.ts";

const ORDINAL_ENDINGS: Readonly<Record<number, string>> = { 1: "st", 2: "nd", 3: "rd" };

function placeText(place: number, players: number): string {
  return `${String(place)}${ORDINAL_ENDINGS[place] ?? "th"} of ${String(players)}`;
}

function usernameOf(name: RecordName): string {
  return name.kind === "player" ? name.username : RESERVED_USERNAME;
}

export function matchHistoryThen(opened: MatchHistoryResponse | null) {
  if (opened === null) {
    return "no match history opened";
  }
  if (opened.kind === "account_gone") {
    return "This player's account no longer exists.";
  }
  return opened.games.map((game) => ({
    date: new Date(game.endedAt).toISOString().slice(0, 10),
    result: game.result,
    place: placeText(game.place, game.players),
    score: game.score,
    winner: usernameOf(game.winner),
    winner_score: game.winnerScore,
    players: game.players,
    turns: game.turns,
  }));
}
