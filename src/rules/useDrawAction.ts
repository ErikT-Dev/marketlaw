import type { Kind } from "../shared/catalogue/Kind";
import type { Tier } from "../shared/catalogue/Tier";
import { DRAW_ACTION_COSTS } from "../shared/DRAW_ACTION_COSTS";
import type { SeatNumber } from "../shared/SeatNumber";
import { drawIntoHand } from "./drawIntoHand";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import { updateSeat } from "./updateSeat";

type DrawAction = {
  readonly seat: SeatNumber;
  readonly kind: Kind;
  readonly tier: Tier;
};

export function useDrawAction(state: GameState, action: DrawAction, random: Random): GameState {
  const { seat, kind, tier } = action;
  const paid = updateSeat(state, seat, (current) => ({
    ...current,
    stats: { ...current.stats, influence: current.stats.influence - DRAW_ACTION_COSTS[tier] },
    actionsThisTurn: current.actionsThisTurn + 1,
  }));
  return drawIntoHand(paid, { seat, cause: "draw_action", target: { by: "kind", kind }, tier }, random);
}
