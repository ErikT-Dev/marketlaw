import type { MainPhaseLogEntry } from "../shared/MainPhaseLogEntry";
import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import { seatsInPlayerOrderOf } from "./seatsInPlayerOrderOf";

export function incomeGainEntriesOf(
  state: GameState,
  next: { readonly turn: number; readonly firstPlayer: SeatNumber },
): ReadonlyArray<MainPhaseLogEntry> {
  const inOrder = seatsInPlayerOrderOf({ seats: state.seats, firstPlayer: next.firstPlayer });
  return inOrder.flatMap((seat): ReadonlyArray<MainPhaseLogEntry> => {
    const atStart = state.mainPhaseStart.seats.find((start) => start.seat === seat.seat) ?? seat;
    const income = seat.stats.income - atStart.stats.income;
    return income > 0 ? [{ kind: "income_gained", turn: next.turn, seat: seat.seat, income }] : [];
  });
}
