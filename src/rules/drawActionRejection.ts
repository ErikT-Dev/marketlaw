import type { Kind } from "../shared/catalogue/Kind";
import type { Tier } from "../shared/catalogue/Tier";
import type { ReasonCode } from "../shared/ReasonCode";
import { influenceDrawOfTier } from "../shared/ruleFiles/influenceDrawOfTier";
import { STAT_KEYS } from "../shared/STAT_KEYS";
import { kindTierKey } from "./kindTierKey";
import type { SeatState } from "./SeatState";

export function drawActionRejection(
  seat: SeatState,
  kindTiersLeft: ReadonlyArray<string>,
  kind: Kind,
  tier: Tier,
): ReasonCode | undefined {
  const draw = influenceDrawOfTier(tier);
  if (draw === undefined) {
    return "unknown_action";
  }
  if (!kindTiersLeft.includes(kindTierKey(kind, tier))) {
    return "no_card_of_kind";
  }
  const canAfford = STAT_KEYS.every((stat) => seat.stats[stat] >= (draw.costs[stat] ?? 0));
  return canAfford ? undefined : "cannot_afford_trade";
}
