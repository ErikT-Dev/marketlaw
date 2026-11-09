import type { GameResult } from "../../../shared/GameResult";
import { isAbandoned } from "../../../shared/isAbandoned";
import type { SeatNumber } from "../../../shared/SeatNumber";

export function afterGameResultLine(
  result: GameResult,
  nameOf: (seat: SeatNumber) => string,
  viewer: SeatNumber,
): string {
  const winner = result.places[0];
  if (isAbandoned(result.endedBy) || winner === undefined) {
    return "Game over · abandoned with no winner";
  }
  const who = winner.seat === viewer ? "You" : nameOf(winner.seat);
  return `Game over · ${who} won with ${String(winner.score)} points`;
}
