import type { Kind } from "../shared/catalogue/Kind";
import type { Tier } from "../shared/catalogue/Tier";
import { DRAW_ACTION_COSTS } from "../shared/DRAW_ACTION_COSTS";
import type { ReasonCode } from "../shared/ReasonCode";
import { cardsLeftAsSeenBy } from "./cardsLeftAsSeenBy";
import type { GameState } from "./GameState";
import { isAskedCard } from "./isAskedCard";
import type { SeatState } from "./SeatState";

export function drawActionRejection(
  state: GameState,
  seat: SeatState,
  kind: Kind,
  tier: Tier,
): ReasonCode | undefined {
  const isLeft = cardsLeftAsSeenBy(state, seat.seat).some((card) =>
    isAskedCard(card, { by: "kind", kind, tier }),
  );
  if (!isLeft) {
    return "no_card_of_kind";
  }
  return seat.stats.influence < DRAW_ACTION_COSTS[tier] ? "cannot_afford_trade" : undefined;
}
