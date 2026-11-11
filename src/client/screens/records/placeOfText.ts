import { placeOrdinal } from "../game/placeOrdinal";

export function placeOfText(place: number, players: number): string {
  return `${placeOrdinal(place - 1)} of ${String(players)}`;
}
