import { Sector } from "../shared/catalogue/Sector";
import type { PlayerView } from "../shared/PlayerView";
import type { ActionIntent } from "../shared/protocol/ActionIntent";
import type { BotChooser } from "./BotChooser";
import { oneOf } from "./oneOf";
import { ownSeatOf } from "./ownSeatOf";

export function turnDrawMove(view: PlayerView, chooser: BotChooser): ActionIntent | null {
  const seat = ownSeatOf(view);
  if (seat.turnDrawRejection !== null) {
    return null;
  }
  const marketCards = view.marketplace.flatMap(({ card }) => (card === null ? [] : [card]));
  const card = seat.marketCardRejection === null ? oneOf(marketCards, chooser) : undefined;
  if (card !== undefined && chooser.pickIndex(2) === 0) {
    return { type: "turn_draw", choice: { option: "A", card } };
  }
  return {
    type: "turn_draw",
    choice: { option: "B", sector: oneOf(Sector.options, chooser) ?? "Residential" },
  };
}
