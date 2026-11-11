import type { PlayerView } from "../../../shared/PlayerView";
import type { SeatNumber } from "../../../shared/SeatNumber";
import type { PlayerStatus } from "../../components/PlayerStatus";
import type { OrderBadge } from "./OrderBadge";
import { playerNameOf } from "./playerNameOf";

function statusOf(
  view: PlayerView,
  seat: SeatNumber,
  awaySeats: ReadonlyArray<SeatNumber>,
): PlayerStatus {
  const seatView = view.seats.find((candidate) => candidate.seat === seat);
  if (seatView === undefined || view.phase === "ended") {
    return "none";
  }
  if (view.phase === "main" && seatView.hasLeft) {
    return "left";
  }
  if (view.phase === "main" && awaySeats.includes(seat)) {
    return "away";
  }
  if (view.phase !== "main") {
    return "none";
  }
  if (seatView.isDone) {
    return "done";
  }
  return seatView.isOutOfTime ? "outOfTime" : "none";
}

export function orderBadgesOf(
  view: PlayerView,
  playerNames: ReadonlyArray<string>,
  awaySeats: ReadonlyArray<SeatNumber> = [],
): ReadonlyArray<OrderBadge> {
  const seatsThatLeft = view.seats.filter((seat) => seat.hasLeft).map((seat) => seat.seat);
  return [...view.playerOrder, ...seatsThatLeft].map((seat) => ({
    seat,
    name: playerNameOf(playerNames, seat),
    status: statusOf(view, seat, awaySeats),
    isFirstPlayer: seat === view.playerOrder[0],
  }));
}
