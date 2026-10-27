import { describe, expect, it } from "vitest";
import { apply } from "./apply";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import { invariantViolations } from "./invariantViolations";
import { seededRandom } from "./seededRandom";
import { setUpGame } from "./setUpGame";
import { STARTING_STATS } from "./STARTING_STATS";

const START = setUpGame({ players: 2 }, seededRandom(21, 0));

function transition(before: GameState, action: GameAction, after: GameState) {
  return {
    before,
    beforeAsText: JSON.stringify(before),
    action,
    outcome: { isOk: true as const, value: after },
  };
}

function withSeat1(state: GameState, change: Partial<GameState["seats"][number]>): GameState {
  return {
    ...state,
    seats: state.seats.map((seat) => (seat.seat === 1 ? { ...seat, ...change } : seat)),
  };
}

describe("invariantViolations", () => {
  it("finds nothing wrong in games played with every action", () => {
    const random = seededRandom(21, 1);
    const actions: ReadonlyArray<GameAction> = START.seats.flatMap((seat) => [
      { type: "play_card", seat: seat.seat, card: seat.hand[0] ?? "Pub" },
      { type: "play_card", seat: seat.seat, card: seat.hand[1] ?? "Pub" },
      { type: "sell", seat: seat.seat, cards: [seat.hand[2] ?? "Pub", seat.hand[3] ?? "Pub"] },
      { type: "end_turn", seat: seat.seat },
      { type: "end_turn", seat: seat.seat },
    ]);
    const violations = actions.reduce<{ state: GameState; found: ReadonlyArray<string> }>(
      ({ state, found }, action) => {
        const outcome = apply(state, action, random);
        const checked = { before: state, beforeAsText: JSON.stringify(state), action, outcome };
        const next = outcome.isOk ? outcome.value : state;
        return { state: next, found: [...found, ...invariantViolations(checked)] };
      },
      { state: START, found: [] },
    );
    expect(violations.found).toEqual([]);
    expect(violations.state.turn).toBe(2);
  });

  it("reports a lost card and negative funds", () => {
    const after = withSeat1({ ...START, deck: START.deck.slice(1) }, {
      stats: { ...STARTING_STATS, funds: -1 },
    });
    expect(invariantViolations(transition(START, { type: "end_turn", seat: 1 }, after))).toEqual([
      `I1: ${START.deck[0] ?? ""} is in no place`,
      "I7: seat 1 has negative funds",
    ]);
  });

  it("reports a card in two places and an action limit passed", () => {
    const after = withSeat1(START, { hand: [...(START.seats[0]?.hand ?? []), START.deck[0] ?? "Pub"], actionsThisTurn: 51 });
    expect(invariantViolations(transition(START, { type: "end_turn", seat: 1 }, after))).toEqual([
      `I1: ${START.deck[0] ?? ""} is in more than one place`,
      "I17: seat 1 took 51 actions this turn",
    ]);
  });

  it("reports actions by a done seat and cards played beyond the rules", () => {
    const before = withSeat1({ ...START, turn: 3 }, { isDone: true, hasPlayedThisTurn: true, hasSkippedBuild: true });
    const action: GameAction = { type: "play_card", seat: 1, card: "Brownstone" };
    expect(invariantViolations(transition(before, action, before))).toEqual([
      "I18: seat 1 took an action while done or after leaving",
      "I5: Brownstone was played in turn 3",
      "I6: seat 1 played more cards than its build passes allow",
    ]);
  });

  it("reports a bonus of 10 or more kept after the end of the turn", () => {
    const after = withSeat1({ ...START, turn: 2 }, { stats: { ...STARTING_STATS, bonus: 12 } });
    expect(invariantViolations(transition(START, { type: "end_turn", seat: 1 }, after))).toEqual([
      "I10: seat 1 kept a bonus of 10 or more",
    ]);
  });

  it("reports a rejected action that changed the state", () => {
    const checked = {
      before: START,
      beforeAsText: JSON.stringify({ ...START, turn: 9 }),
      action: { type: "end_turn", seat: 1 } as const,
      outcome: { isOk: false as const, error: { code: "already_done" as const } },
    };
    expect(invariantViolations(checked)).toEqual(["I27: a rejected action changed the game state"]);
    expect(invariantViolations({ ...checked, beforeAsText: JSON.stringify(START) })).toEqual([]);
  });
});
