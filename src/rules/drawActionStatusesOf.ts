import { Kind } from "../shared/catalogue/Kind";
import { Tier } from "../shared/catalogue/Tier";
import type { DrawActionStatus } from "../shared/DrawActionStatus";
import { drawActionRejection } from "./drawActionRejection";
import type { GameState } from "./GameState";
import { kindTierKey } from "./kindTierKey";
import { kindTiersLeftAsSeenBy } from "./kindTiersLeftAsSeenBy";
import type { SeatState } from "./SeatState";
import { turnRejectionOf } from "./turnRejectionOf";

export function drawActionStatusesOf(
  state: GameState,
  seat: SeatState,
): ReadonlyArray<DrawActionStatus> {
  const turnRejection = turnRejectionOf(state, seat.seat, "draw_action");
  const kindTiersLeft = kindTiersLeftAsSeenBy(state, seat.seat);
  return Kind.options.flatMap((kind) =>
    Tier.options.map((tier) => ({
      kind,
      tier,
      isAnyLeft: kindTiersLeft.includes(kindTierKey(kind, tier)),
      rejection: turnRejection ?? drawActionRejection(seat, kindTiersLeft, kind, tier) ?? null,
    })),
  );
}
