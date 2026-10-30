import type { GameResult } from "../../../shared/GameResult";
import type { SeatNumber } from "../../../shared/SeatNumber";
import { listedNames } from "./listedNames";

export function gameOverTexts(
  result: GameResult,
  turn: number,
  nameOf: (seat: SeatNumber) => string,
): { readonly title: string; readonly why: string } {
  const winner = result.places[0];
  const title = winner === undefined ? "The game is over" : `${nameOf(winner.seat)} wins!`;
  if (result.endedBy === "turn_limit") {
    return {
      title,
      why: `Nobody reached the end goal by turn ${String(turn)}, the last turn, so the game ended after that main phase. Casual game: ratings do not change.`,
    };
  }
  const reached = result.places
    .filter((place) => place.hasReachedEndGoal)
    .map((place) => nameOf(place.seat));
  return {
    title,
    why: `${listedNames(reached)} reached income 22 and all 3 projects in turn ${String(turn)}, so the game ended after that main phase. Casual game: ratings do not change.`,
  };
}
