import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { GameMenuPlace } from "../menu/GameMenuPlace";

export function gameMenuPlaceOf(view: PlayerView, seat: OwnSeatView): GameMenuPlace {
  return view.result === null && !seat.hasLeft ? "game" : "game_over";
}
