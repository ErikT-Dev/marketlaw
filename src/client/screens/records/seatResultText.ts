import type { GameRecordSeat } from "../../../shared/api/GameRecordSeat";
import { placeOrdinal } from "../game/placeOrdinal";

export function seatResultText({ place, result, leftInTurn }: GameRecordSeat): string {
  const shown = leftInTurn === null ? result : `left (turn ${String(leftInTurn)})`;
  return `${placeOrdinal(place - 1)} · ${shown}`;
}
