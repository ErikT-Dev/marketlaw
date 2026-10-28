import type { PlayerView } from "../../../shared/PlayerView";
import type { SeatNumber } from "../../../shared/SeatNumber";
import type { PlayerStatus } from "../../components/PlayerStatus";
import type { OrderBadge } from "./OrderBadge";
import { playerNameOf } from "./playerNameOf";

function statusOf(view: PlayerView, seat: SeatNumber): PlayerStatus {
  const seatView = view.seats.find((candidate) => candidate.seat === seat);
  if (view.phase !== "main" || seatView === undefined) {
    return "none";
  }
  if (seatView.hasLeft) {
    return "left";
  }
  return seatView.isDone ? "done" : "none";
}

export function orderBadgesOf(
  view: PlayerView,
  playerNames: ReadonlyArray<string>,
): ReadonlyArray<OrderBadge> {
  const seatsThatLeft = view.seats.filter((seat) => seat.hasLeft).map((seat) => seat.seat);
  return [...view.playerOrder, ...seatsThatLeft].map((seat) => ({
    seat,
    name: playerNameOf(playerNames, seat),
    status: statusOf(view, seat),
    isFirstPlayer: seat === view.playerOrder[0],
  }));
}
