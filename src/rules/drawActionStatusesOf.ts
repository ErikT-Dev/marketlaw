import { Kind } from "../shared/catalogue/Kind";
import { Tier } from "../shared/catalogue/Tier";
import type { DrawActionStatus } from "../shared/DrawActionStatus";
import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import { rejectionOf } from "./rejectionOf";

export function drawActionStatusesOf(
  state: GameState,
  seat: SeatNumber,
): ReadonlyArray<DrawActionStatus> {
  return Kind.options.flatMap((kind) =>
    Tier.options.map((tier) => ({
      kind,
      tier,
      rejection: rejectionOf(state, { type: "draw_action", seat, kind, tier }) ?? null,
    })),
  );
}
