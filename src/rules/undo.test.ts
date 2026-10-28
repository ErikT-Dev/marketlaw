import { describe, expect, it } from "vitest";
import { apply } from "./apply";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import { seatOf } from "./seatOf";
import { startSavedGame } from "./startSavedGame";
import { updateSeat } from "./updateSeat";

const NO_RANDOM: Random = {
  pickSector: () => "Public",
  pickTier: () => 1,
  pickQuest: (candidates) => candidates[0] ?? "Farmland",
  pickType: (candidates) => candidates[0] ?? "Farm",
  shuffle: (cards) => cards,
};

function accepted(state: GameState, action: GameAction): GameState {
  const result = apply(state, action, NO_RANDOM);
  if (!result.isOk) {
    throw new Error(`${action.type} rejected: ${result.error.code}`);
  }
  return result.value;
}

describe("undo", () => {
  it("keeps the time bank as it is now and counts itself as an action", () => {
    const start = startSavedGame({ players: 2 }, 7).state;
    const traded = accepted(start, { type: "influence", seat: 1, trade: "fund_to_influence" });
    const timeUsed = updateSeat(traded, 1, (seat) => ({ ...seat, timeBankMs: 1_000 }));
    const undone = seatOf(accepted(timeUsed, { type: "undo", seat: 1 }), 1);
    expect(undone?.stats).toEqual(seatOf(start, 1)?.stats);
    expect(undone?.timeBankMs).toBe(1_000);
    expect(undone?.actionsThisTurn).toBe(2);
  });

  it("starts every main phase with nothing to undo", () => {
    const start = startSavedGame({ players: 2 }, 7).state;
    const traded = accepted(start, { type: "influence", seat: 1, trade: "fund_to_influence" });
    const nextTurn = accepted(accepted(traded, { type: "end_turn", seat: 1 }), {
      type: "end_turn",
      seat: 2,
    });
    const result = apply(nextTurn, { type: "undo", seat: 1 }, NO_RANDOM);
    expect(result.isOk ? null : result.error.code).toBe("nothing_to_undo");
  });
});
