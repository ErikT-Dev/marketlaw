import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import { playerNameOf } from "./playerNameOf";

export function marketGoText(
  view: PlayerView,
  seat: OwnSeatView,
  playerNames: ReadonlyArray<string>,
): string | null {
  if (view.marketGo === null) {
    return null;
  }
  return view.marketGo === seat.seat
    ? "Your go"
    : `${playerNameOf(playerNames, view.marketGo)}'s go`;
}
