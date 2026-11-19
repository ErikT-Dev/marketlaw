import type { OwnSeatView } from "../shared/OwnSeatView";
import type { ActionIntent } from "../shared/protocol/ActionIntent";
import type { BotChooser } from "./BotChooser";
import { oneOf } from "./oneOf";

const UNDO_ROLL = 0;
const TRADE_ROLL = 1;
const DRAW_ACTION_ROLL = 2;
const REDRAW_ROLL = 3;

export function influenceOrUndoMove(seat: OwnSeatView, chooser: BotChooser): ActionIntent | null {
  const roll = chooser.pickIndex(20);
  if (roll === UNDO_ROLL && seat.undoRejection === null) {
    return { type: "undo" };
  }
  if (roll === REDRAW_ROLL && seat.redrawRejection === null) {
    return { type: "redraw_hand" };
  }
  if (roll === TRADE_ROLL) {
    const trade = oneOf(
      seat.trades.filter(({ rejection }) => rejection === null),
      chooser,
    );
    return trade === undefined ? null : { type: "influence", trade: trade.trade };
  }
  if (roll === DRAW_ACTION_ROLL) {
    const draw = oneOf(
      seat.drawActions.filter(({ rejection }) => rejection === null),
      chooser,
    );
    return draw === undefined ? null : { type: "draw_action", kind: draw.kind, tier: draw.tier };
  }
  return null;
}
