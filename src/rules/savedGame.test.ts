import { describe, expect, it } from "vitest";
import { applyToSavedGame } from "./applyToSavedGame";
import type { GameAction } from "./GameAction";
import { randomForNextAction } from "./randomForNextAction";
import { replayStartOf } from "./replayStartOf";
import { SAVE_SCHEMA_VERSION } from "./SAVE_SCHEMA_VERSION";
import type { SavedGame } from "./SavedGame";
import { startSavedGame } from "./startSavedGame";

function replay(saved: SavedGame): SavedGame {
  return saved.actionLog.reduce((game, action) => {
    const result = applyToSavedGame(game, action, randomForNextAction(game));
    if (!result.isOk) {
      throw new Error(`replay rejected ${action.type}: ${result.error.code}`);
    }
    return result.value;
  }, replayStartOf(saved));
}

function playThreeTurns(saved: SavedGame): SavedGame {
  const actions: ReadonlyArray<GameAction> = [1, 2, 3].flatMap(() => [
    { type: "end_turn", seat: 1 },
    { type: "end_turn", seat: 2 },
  ]);
  return actions.reduce((game, action) => {
    const result = applyToSavedGame(game, action, randomForNextAction(game));
    return result.isOk ? result.value : game;
  }, saved);
}

describe("saved games", () => {
  it("starts a game with the setup, the seed and an empty action log", () => {
    const saved = startSavedGame({ players: 3 }, 42);
    expect(saved.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(saved.actionLog).toEqual([]);
    expect(saved.state.seats.map((seat) => seat.hand.length)).toEqual([7, 7, 7]);
    expect(saved.state.deck).toHaveLength(240 - 21 - 8);
  });

  it("deals the same game from the same seed and a different game from another seed", () => {
    expect(startSavedGame({ players: 2 }, 7).state).toEqual(startSavedGame({ players: 2 }, 7).state);
    expect(startSavedGame({ players: 2 }, 7).state.deck).not.toEqual(
      startSavedGame({ players: 2 }, 8).state.deck,
    );
  });

  it("records accepted actions and replays them to the same state", () => {
    const saved = playThreeTurns(startSavedGame({ players: 2 }, 11));
    expect(saved.state.turn).toBe(4);
    expect(saved.actionLog).toHaveLength(6);
    expect(replay(saved).state).toEqual(saved.state);
  });

  it("does not record a rejected action", () => {
    const saved = startSavedGame({ players: 2 }, 5);
    const result = applyToSavedGame(saved, { type: "end_turn", seat: 3 }, randomForNextAction(saved));
    expect(result).toEqual({ isOk: false, error: { code: "not_in_game" } });
  });

  it("replays a game that started from a given state from that state", () => {
    const fresh = startSavedGame({ players: 2 }, 11);
    const given = { ...fresh.state, turn: 6 };
    const started = { ...fresh, startingState: given, state: given };
    const played = playThreeTurns(started);
    expect(played.actionLog.length).toBeGreaterThan(0);
    expect(replay(played).state).toEqual(played.state);
  });
});
