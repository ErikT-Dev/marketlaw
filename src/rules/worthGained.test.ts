import { describe, expect, it } from "vitest";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import type { GameAction } from "./GameAction";
import { applyToSavedGame } from "./applyToSavedGame";
import { randomForNextAction } from "./randomForNextAction";
import type { SavedGame } from "./SavedGame";
import { startSavedGame } from "./startSavedGame";
import { viewFor } from "./viewFor";

function savedWithInfluence(): SavedGame {
  const saved = startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 5);
  return {
    ...saved,
    state: {
      ...saved.state,
      seats: saved.state.seats.map((seat) => ({ ...seat, stats: { ...seat.stats, influence: 4 } })),
    },
  };
}

function afterActions(saved: SavedGame, actions: ReadonlyArray<GameAction>): SavedGame {
  return actions.reduce((current, action, index) => {
    const result = applyToSavedGame(
      current,
      action,
      GAME_STARTED_AT + 1_000 * (index + 1),
      randomForNextAction(current),
    );
    if (!result.isOk) {
      throw new Error(`rejected ${action.type}: ${JSON.stringify(result.error)}`);
    }
    return result.value;
  }, saved);
}

describe("total worth gained", () => {
  it("adds the funds received at the start of the next turn", () => {
    const saved = savedWithInfluence();
    const ended = afterActions(saved, [
      { type: "end_turn", seat: 1 },
      { type: "end_turn", seat: 2 },
    ]);
    const before = saved.state.seats.find(({ seat }) => seat === 1);
    const after = ended.state.seats.find(({ seat }) => seat === 1);
    const fundsReceived = (after?.stats.funds ?? 0) - (before?.stats.funds ?? 0);
    expect(ended.state.turn).toBe(2);
    expect(fundsReceived).toBeGreaterThan(0);
    expect(after?.worthGained).toBe(14 + fundsReceived);
  });

  it("shows another player's total worth gained as at the start of their main phase", () => {
    const traded = afterActions(savedWithInfluence(), [
      { type: "influence", seat: 1, trade: "influence_to_funds" },
    ]);
    const ownView = viewFor(traded.state, 1).seats.find(({ seat }) => seat === 1);
    const otherView = viewFor(traded.state, 2).seats.find(({ seat }) => seat === 1);
    expect(ownView?.worthGained).toBe(16);
    expect(otherView?.worthGained).toBe(14);
  });
});
