import { describe, expect, it } from "vitest";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import { apply } from "./apply";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import { invariantViolations } from "./invariantViolations";
import { seededRandom } from "./seededRandom";
import { setUpGame } from "./setUpGame";
import { STARTING_STATS } from "./STARTING_STATS";

const LAST_END_TURN: GameAction = { type: "end_turn", seat: 2 };

function beforeTurnEnds(): GameState {
  const start = setUpGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, seededRandom(21, 0));
  const ended = apply(start, { type: "end_turn", seat: 1 }, seededRandom(21, 1), GAME_STARTED_AT);
  if (!ended.isOk) {
    throw new Error(`end_turn rejected: ${ended.error.code}`);
  }
  return {
    ...ended.value,
    seats: ended.value.seats.map((seat) => ({
      ...seat,
      stats: { ...STARTING_STATS, product: 1, quality: -3 },
    })),
  };
}

function violationsAfter(before: GameState, after: GameState): ReadonlyArray<string> {
  const outcome = { isOk: true as const, value: after };
  const checked = { before, beforeAsText: JSON.stringify(before), action: LAST_END_TURN, outcome };
  return invariantViolations(checked).filter((violation) => violation.startsWith("I10"));
}

describe("the end-of-turn funds invariant", () => {
  it("finds nothing wrong when income and the stats gain go into funds", () => {
    const before = beforeTurnEnds();
    const ended = apply(before, LAST_END_TURN, seededRandom(21, 2), GAME_STARTED_AT);
    if (!ended.isOk) {
      throw new Error(`end_turn rejected: ${ended.error.code}`);
    }
    expect(ended.value.turn).toBe(2);
    expect(ended.value.seats.map((seat) => seat.stats.funds)).toEqual([101, 101]);
    expect(violationsAfter(before, ended.value)).toEqual([]);
  });

  it("reports funds after the end of the turn without the income and the stats gain", () => {
    const before = beforeTurnEnds();
    const after = {
      ...before,
      turn: 2,
      seats: before.seats.map((seat) => ({ ...seat, stats: { ...seat.stats, funds: 100 } })),
    };
    expect(violationsAfter(before, after)).toEqual([
      "I10: seat 1 has 100 funds after the end of the turn, less than 101",
      "I10: seat 2 has 100 funds after the end of the turn, less than 101",
    ]);
  });
});
