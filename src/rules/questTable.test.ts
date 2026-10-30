import { describe, expect, it } from "vitest";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import { apply } from "./apply";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import { setUpGame } from "./setUpGame";
import { seededRandom } from "./seededRandom";
import { withMainPhaseStart } from "./withMainPhaseStart";

const FIRST_CHOICES: Random = {
  pickSector: () => "Public",
  pickTier: () => 2,
  pickQuest: (candidates) => candidates[0] ?? "Farmland",
  pickType: (candidates) => candidates[0] ?? "Farm",
  shuffle: (cards) => cards,
};

function played(state: GameState, actions: ReadonlyArray<GameAction>): GameState {
  return actions.reduce((current, action) => {
    const result = apply(current, action, FIRST_CHOICES, GAME_STARTED_AT);
    if (!result.isOk) {
      throw new Error(`${action.type} rejected: ${result.error.code}`);
    }
    return result.value;
  }, state);
}

describe("the quests table at the start of a turn", () => {
  it("leaves a place empty when the list holds only quests of tiers not allowed yet", () => {
    const start = setUpGame({ players: 2, startedAt: GAME_STARTED_AT }, seededRandom(5, 0));
    const state = withMainPhaseStart({
      ...start,
      turn: 3,
      quests: [{ quest: "Trading post", turnsOnTable: 1 }],
      questList: ["Safe streets", "Metropolis"],
      seats: start.seats.map((seat) =>
        seat.seat === 1
          ? { ...seat, city: ["Apparel Store"], stats: { ...seat.stats, income: 4 } }
          : seat,
      ),
    });
    const after = played(state, [
      { type: "complete_quest", seat: 1, quest: "Trading post" },
      { type: "end_turn", seat: 1 },
      { type: "end_turn", seat: 2 },
    ]);
    expect(after.turn).toBe(4);
    expect(after.quests).toEqual([null]);
    expect(after.questList).toEqual(["Safe streets", "Metropolis"]);
  });
});
