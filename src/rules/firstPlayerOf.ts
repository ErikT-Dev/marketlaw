import type { SeatNumber } from "../shared/SeatNumber";
import type { SeatState } from "./SeatState";

export function firstPlayerOf(turn: number, seats: ReadonlyArray<SeatState>): SeatNumber {
  const rotation = (turn - 1) % seats.length;
  const fromRotation = [...seats.slice(rotation), ...seats.slice(0, rotation)];
  return (fromRotation.find((seat) => seat.departure === null) ?? seats[rotation])?.seat ?? 1;
}
