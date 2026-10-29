import type { Kind } from "../shared/catalogue/Kind";
import type { Tier } from "../shared/catalogue/Tier";
import { DRAW_ACTION_COSTS } from "../shared/DRAW_ACTION_COSTS";
import type { ReasonCode } from "../shared/ReasonCode";
import { kindTierKey } from "./kindTierKey";
import type { SeatState } from "./SeatState";

export function drawActionRejection(
  seat: SeatState,
  kindTiersLeft: ReadonlyArray<string>,
  kind: Kind,
  tier: Tier,
): ReasonCode | undefined {
  if (!kindTiersLeft.includes(kindTierKey(kind, tier))) {
    return "no_card_of_kind";
  }
  return seat.stats.influence < DRAW_ACTION_COSTS[tier] ? "cannot_afford_trade" : undefined;
}
