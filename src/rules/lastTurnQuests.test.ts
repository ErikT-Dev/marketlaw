import { describe, expect, it } from "vitest";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import { apply } from "./apply";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import { STARTING_STATS } from "./STARTING_STATS";
import { startSavedGame } from "./startSavedGame";
import { viewFor } from "./viewFor";
import { withMainPhaseStart } from "./withMainPhaseStart";

const FIRST_CANDIDATES: Random = {
  pickSector: () => "Public",
  pickTier: () => 1,
  pickQuest: (candidates) => candidates[0] ?? "Farmland",
  pickType: (candidates) => candidates[0] ?? "Farm",
  shuffle: (cards) => [...cards].reverse(),
};

const EVERYONE_ENDS: ReadonlyArray<GameAction> = [
  { type: "end_turn", seat: 1 },
  { type: "end_turn", seat: 2 },
];

function gameWithTradingPost(): GameState {
  const state = startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 13).state;
  return withMainPhaseStart({
    ...state,
    turn: 4,
    firstPlayer: 1,
    quests: [{ quest: "Trading post", turnsOnTable: 2, isInExtraTurn: false }],
    seats: state.seats.map((seat) => ({
      ...seat,
      city: ["Liquor Shop"],
      stats: { ...STARTING_STATS, income: 40 },
    })),
  });
}

function played(state: GameState, actions: ReadonlyArray<GameAction>): GameState {
  return actions.reduce((current, action) => {
    const result = apply(current, action, FIRST_CANDIDATES, GAME_STARTED_AT);
    if (!result.isOk) {
      throw new Error(`${action.type} rejected: ${result.error.code}`);
    }
    return result.value;
  }, state);
}

describe("the quests of the last turn panel", () => {
  it("names the extra funds of a first completion for every seat that completed it", () => {
    const after = played(gameWithTradingPost(), [
      { type: "complete_quest", seat: 1, quest: "Trading post" },
      { type: "complete_quest", seat: 2, quest: "Trading post" },
      ...EVERYONE_ENDS,
    ]);
    expect(viewFor(after, 2).lastTurn.quests).toEqual([
      { quest: "Trading post", seats: [1, 2], firstCompletionFunds: 2 },
    ]);
  });

  it("names no extra funds for a completion during the quest's extra turn", () => {
    const firstTurn = played(gameWithTradingPost(), [
      { type: "complete_quest", seat: 1, quest: "Trading post" },
      ...EVERYONE_ENDS,
    ]);
    const start = gameWithTradingPost();
    const after = played(withMainPhaseStart({ ...firstTurn, phase: start.phase }), [
      { type: "complete_quest", seat: 2, quest: "Trading post" },
      ...EVERYONE_ENDS,
    ]);
    expect(viewFor(after, 1).lastTurn.quests).toEqual([
      { quest: "Trading post", seats: [2], firstCompletionFunds: 0 },
    ]);
  });
});
