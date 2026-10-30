import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import { playerOrderOf } from "./playerOrderOf";

export function marketGoOf(state: GameState): SeatNumber | null {
  if (state.phase !== "market") {
    return null;
  }
  return (
    playerOrderOf(state).find(
      (seatNumber) => state.seats.find((seat) => seat.seat === seatNumber)?.hasHadMarketGo === false,
    ) ?? null
  );
}
