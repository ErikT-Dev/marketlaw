import type { OwnSeatView } from "../shared/OwnSeatView";
import type { PlayerView } from "../shared/PlayerView";

export function ownSeatOf(view: PlayerView): OwnSeatView {
  const own = view.seats.find((seat) => seat.kind === "own");
  if (own?.kind !== "own") {
    throw new Error("a player view without the player's own seat");
  }
  return own;
}
