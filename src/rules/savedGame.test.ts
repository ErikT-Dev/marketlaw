import * as v from "valibot";
import { describe, expect, it } from "vitest";
import endedFixture from "./fixtures/savedGameVersion21Ended.json" with { type: "json" };
import runningFixture from "./fixtures/savedGameVersion21Running.json" with { type: "json" };
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import { applyToSavedGame } from "./applyToSavedGame";
import { FIRST_PUBLIC_SAVE_SCHEMA_VERSION } from "./FIRST_PUBLIC_SAVE_SCHEMA_VERSION";
import type { GameAction } from "./GameAction";
import { migratedSavedGame } from "./migratedSavedGame";
import { randomForNextAction } from "./randomForNextAction";
import { replayStartOf } from "./replayStartOf";
import { SAVE_MIGRATION_STEPS } from "./SAVE_MIGRATION_STEPS";
import { SAVE_SCHEMA_VERSION } from "./SAVE_SCHEMA_VERSION";
import type { SavedGame } from "./SavedGame";
import { startSavedGame } from "./startSavedGame";

const STORED_SAVE = v.custom<SavedGame>(
  (value) => typeof value === "object" && value !== null && "schemaVersion" in value,
);

function replay(saved: SavedGame): SavedGame {
  return saved.actionLog.reduce((game, { action, at }) => {
    const result = applyToSavedGame(game, action, at, randomForNextAction(game));
    if (!result.isOk) {
      throw new Error(`replay rejected ${action.type}: ${result.error.code}`);
    }
    return result.value;
  }, replayStartOf(saved));
}

function marketGo(seat: 1 | 2): GameAction {
  return { type: "turn_draw", seat, choice: { option: "B", sector: "Service" } };
}

function playThreeTurns(saved: SavedGame): SavedGame {
  const endTurns: ReadonlyArray<GameAction> = [
    { type: "end_turn", seat: 1 },
    { type: "end_turn", seat: 2 },
  ];
  const actions = [
    ...endTurns,
    marketGo(2),
    marketGo(1),
    ...endTurns,
    marketGo(1),
    marketGo(2),
    ...endTurns,
  ];
  return actions.reduce((game, action) => {
    const result = applyToSavedGame(game, action, GAME_STARTED_AT, randomForNextAction(game));
    return result.isOk ? result.value : game;
  }, saved);
}

describe("saved games", () => {
  it("starts a game with the setup, the seed and an empty action log", () => {
    const saved = startSavedGame({ players: 3, kind: "casual", startedAt: GAME_STARTED_AT }, 42);
    expect(saved.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(saved.actionLog).toEqual([]);
    expect(saved.state.seats.map((seat) => seat.hand.length)).toEqual([7, 7, 7]);
    expect(saved.state.deck).toHaveLength(240 - 21 - 8);
  });

  it("deals the same game from the same seed and a different game from another seed", () => {
    expect(startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 7).state).toEqual(startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 7).state);
    expect(startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 7).state.deck).not.toEqual(
      startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 8).state.deck,
    );
  });

  it("records accepted actions and replays them to the same state", () => {
    const saved = playThreeTurns(startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 11));
    expect(saved.state.turn).toBe(4);
    expect(saved.actionLog).toHaveLength(10);
    expect(replay(saved).state).toEqual(saved.state);
  });

  it("does not record a rejected action", () => {
    const saved = startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 5);
    const result = applyToSavedGame(saved, { type: "end_turn", seat: 3 }, GAME_STARTED_AT, randomForNextAction(saved));
    expect(result).toEqual({ isOk: false, error: { code: "not_in_game" } });
  });

  it("replays a game that started from a given state from that state", () => {
    const fresh = startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 11);
    const given = { ...fresh.state, turn: 6 };
    const started = { ...fresh, startingState: given, state: given };
    const played = playThreeTurns(started);
    expect(played.actionLog.length).toBeGreaterThan(0);
    expect(replay(played).state).toEqual(played.state);
  });
});

describe("the saved game format", () => {
  it("has one migration step for every save version since the first public one", () => {
    expect(FIRST_PUBLIC_SAVE_SCHEMA_VERSION + SAVE_MIGRATION_STEPS.length).toBe(
      SAVE_SCHEMA_VERSION,
    );
  });

  it("loads and replays a first public save of a running game and of an ended game", () => {
    for (const fixture of [runningFixture, endedFixture]) {
      const saved = migratedSavedGame(v.parse(STORED_SAVE, fixture));
      expect(saved?.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
      expect(saved === null ? null : replay(saved).state).toEqual(fixture.state);
    }
    expect(endedFixture.state.phase).toBe("ended");
    expect(runningFixture.state.phase).not.toBe("ended");
  });

  it("refuses a save from before the first public version or from a newer version", () => {
    const saved = v.parse(STORED_SAVE, runningFixture);
    expect(migratedSavedGame({ ...saved, schemaVersion: FIRST_PUBLIC_SAVE_SCHEMA_VERSION - 1 })).toBeNull();
    expect(migratedSavedGame({ ...saved, schemaVersion: SAVE_SCHEMA_VERSION + 1 })).toBeNull();
  });
});
