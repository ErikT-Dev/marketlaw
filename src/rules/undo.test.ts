import { describe, expect, it } from "vitest";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
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
  const result = apply(state, action, NO_RANDOM, GAME_STARTED_AT);
  if (!result.isOk) {
    throw new Error(`${action.type} rejected: ${result.error.code}`);
  }
  return result.value;
}

describe("undo", () => {
  it("keeps the time bank as it is now and counts itself as an action", () => {
    const start = startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 7).state;
    const traded = accepted(start, { type: "influence", seat: 1, trade: "fund_to_influence" });
    const timeUsed = updateSeat(traded, 1, (seat) => ({ ...seat, timeBankMs: 1_000 }));
    const undone = seatOf(accepted(timeUsed, { type: "undo", seat: 1 }), 1);
    expect(undone?.stats).toEqual(seatOf(start, 1)?.stats);
    expect(undone?.timeBankMs).toBe(1_000);
    expect(undone?.actionsThisTurn).toBe(2);
  });

  it("starts every main phase with nothing to undo", () => {
    const start = startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 7).state;
    const traded = accepted(start, { type: "influence", seat: 1, trade: "fund_to_influence" });
    const nextTurnActions: ReadonlyArray<GameAction> = [
      { type: "end_turn", seat: 1 },
      { type: "end_turn", seat: 2 },
      { type: "turn_draw", seat: 2, choice: { option: "B", sector: "Service" } },
      { type: "turn_draw", seat: 1, choice: { option: "B", sector: "Service" } },
    ];
    const nextTurn = nextTurnActions.reduce(accepted, traded);
    const result = apply(nextTurn, { type: "undo", seat: 1 }, NO_RANDOM, GAME_STARTED_AT);
    expect(result.isOk ? null : result.error.code).toBe("nothing_to_undo");
  });

  it("takes back only the undoer's sale from a holding pile that holds another player's sale", () => {
    const start = startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 7).state;
    const ownHands = updateSeat(updateSeat(start, 1, (seat) => ({ ...seat, hand: ["Pub", "Cottage"] })), 2, (seat) => ({ ...seat, hand: ["Farm House"] }));
    const sellActions: ReadonlyArray<GameAction> = [
      { type: "sell", seat: 1, cards: ["Pub"] },
      { type: "sell", seat: 2, cards: ["Farm House"] },
      { type: "undo", seat: 1 },
    ];
    const undone = sellActions.reduce(accepted, ownHands);
    expect(seatOf(undone, 1)?.hand).toEqual(["Pub", "Cottage"]);
    expect(seatOf(undone, 1)?.stats.funds).toBe(70);
    expect(seatOf(undone, 2)?.hand).toEqual([]);
    expect(seatOf(undone, 2)?.stats.funds).toBe(80);
    expect(undone.holdingPile).toEqual(["Farm House"]);
  });

  it("undoing a played card leaves the holding pile as it is", () => {
    const start = startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 7).state;
    const ready = updateSeat(start, 1, (seat) => ({ ...seat, hand: ["Pub", "Cottage"] }));
    const actions: ReadonlyArray<GameAction> = [
      { type: "sell", seat: 1, cards: ["Pub"] },
      { type: "play_card", seat: 1, card: "Cottage" },
      { type: "undo", seat: 1 },
    ];
    const undone = actions.reduce(accepted, ready);
    expect(seatOf(undone, 1)?.hand).toEqual(["Cottage"]);
    expect(undone.holdingPile).toEqual(["Pub"]);
  });
});
