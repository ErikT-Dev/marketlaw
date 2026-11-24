import type { Kind } from "../shared/catalogue/Kind";
import { amountsInTenths } from "../shared/amountsInTenths";
import type { Tier } from "../shared/catalogue/Tier";
import { influenceDrawOfTier } from "../shared/ruleFiles/influenceDrawOfTier";
import type { SeatNumber } from "../shared/SeatNumber";
import { STAT_KEYS } from "../shared/STAT_KEYS";
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
  const costs = amountsInTenths(influenceDrawOfTier(tier)?.costs ?? {});
  const paid = updateSeat(state, seat, (current) => ({
    ...current,
    stats: STAT_KEYS.reduce(
      (stats, stat) => ({ ...stats, [stat]: stats[stat] - (costs[stat] ?? 0) }),
      current.stats,
    ),
    actionsThisTurn: current.actionsThisTurn + 1,
  }));
  return drawIntoHand(paid, { seat, cause: "draw_action", target: { by: "kind", kind }, tier }, random);
}
