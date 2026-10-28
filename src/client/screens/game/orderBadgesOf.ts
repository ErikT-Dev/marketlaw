import type { PlayerView } from "../../../shared/PlayerView";
import type { SeatNumber } from "../../../shared/SeatNumber";
import type { PlayerStatus } from "../../components/PlayerStatus";
import type { OrderBadge } from "./OrderBadge";

function statusOf(view: PlayerView, seat: SeatNumber): PlayerStatus {
  const seatView = view.seats.find((candidate) => candidate.seat === seat);
  if (seatView?.hasLeft === true) {
    return "left";
  }
  return view.phase === "main" && seatView?.isDone === true ? "done" : "none";
}

export function orderBadgesOf(
  view: PlayerView,
  playerNames: ReadonlyArray<string>,
): ReadonlyArray<OrderBadge> {
  const seatsThatLeft = view.seats.filter((seat) => seat.hasLeft).map((seat) => seat.seat);
  return [...view.playerOrder, ...seatsThatLeft].map((seat) => ({
    seat,
    name: seat === view.seat ? "You" : (playerNames[seat - 1] ?? `Seat ${String(seat)}`),
    status: statusOf(view, seat),
    isFirstPlayer: seat === view.playerOrder[0],
  }));
}
