import { describe, expect, it } from "vitest";
import { fundsInTenths } from "../shared/fundsInTenths";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import { apply } from "./apply";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import { invariantViolations } from "./invariantViolations";
import { seededRandom } from "./seededRandom";
import { setUpGame } from "./setUpGame";
import { STARTING_STATS } from "./STARTING_STATS";

const START = setUpGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, seededRandom(21, 0));

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

function withEndOfTurnFundsPaid(state: GameState): GameState {
  return {
    ...state,
    seats: state.seats.map((seat) => ({
      ...seat,
      stats: { ...seat.stats, funds: seat.stats.funds + fundsInTenths(10) },
      worthGained: seat.worthGained + fundsInTenths(10),
    })),
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
        const outcome = apply(state, action, random, GAME_STARTED_AT);
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
      "I30: seat 1 total worth gained is 140 after end_turn, but the cards gained and funds received make 69",
      `I1: ${START.deck[0] ?? ""} is in no place`,
      "I7: seat 1 has negative funds",
    ]);
  });

  it("reports total worth gained that is not the cards gained plus the funds received", () => {
    const after = withSeat1(START, { worthGained: (START.seats[0]?.worthGained ?? 0) + fundsInTenths(1) });
    expect(invariantViolations(transition(START, { type: "end_turn", seat: 1 }, after))).toEqual([
      "I30: seat 1 total worth gained is 150 after end_turn, but the cards gained and funds received make 140",
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
    const before = withSeat1({ ...START, turn: 3 }, { isDone: true, hasPlayedThisTurn: true, buildPasses: 0 });
    const action: GameAction = { type: "play_card", seat: 1, card: "Brownstone" };
    expect(invariantViolations(transition(before, action, before))).toEqual([
      "I18: seat 1 took an action while done or after leaving",
      "I5: Brownstone was played in turn 3",
      "I6: seat 1 played more cards than its build passes allow",
      "I30: seat 1 total worth gained is 140 after play_card, but the cards gained and funds received make 210",
    ]);
  });

  it("reports a card played without using exactly 1 build pass", () => {
    const before = withSeat1(START, { buildPasses: 3 });
    const action: GameAction = { type: "play_card", seat: 1, card: START.seats[0]?.hand[0] ?? "Pub" };
    expect(invariantViolations(transition(before, action, before))).toEqual([
      "I6: seat 1 used 0 build passes to play a card",
      "I30: seat 1 total worth gained is 140 after play_card, but the cards gained and funds received make 190",
    ]);
    expect(invariantViolations(transition(before, action, withSeat1(START, { buildPasses: 1 })))).toEqual([
      "I6: seat 1 used 2 build passes to play a card",
      "I30: seat 1 total worth gained is 140 after play_card, but the cards gained and funds received make 190",
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

  it("reports a holding pile kept after the main phase and income that went down", () => {
    const before = withSeat1(START, { stats: { ...STARTING_STATS, income: 5 } });
    const after = withSeat1(
      withEndOfTurnFundsPaid({
        ...START,
        turn: 2,
        firstPlayer: 2,
        holdingPile: [START.deck[0] ?? "Pub"],
        deck: START.deck.slice(1),
      }),
      { stats: { ...STARTING_STATS, income: 4, funds: fundsInTenths(20) } },
    );
    expect(invariantViolations(transition(before, { type: "end_turn", seat: 1 }, after))).toEqual([
      "I2: the holding pile holds 1 cards outside the main phase",
      "I8: seat 1 income went from 5 to 4",
      "I30: seat 1 total worth gained is 240 after end_turn, but the cards gained and funds received make 270",
    ]);
  });

  it("reports income that could have been taken and income below 3", () => {
    const after = withSeat1(START, {
      stats: { ...STARTING_STATS, income: 2, product: 1, distribution: 1 },
    });
    expect(invariantViolations(transition(START, { type: "end_turn", seat: 1 }, after))).toEqual([
      "I8: seat 1 income went from 3 to 2",
      "I9: seat 1 could still take income",
    ]);
  });

  it("reports a project completed twice and a combo claimed more often than allowed", () => {
    const after = withSeat1(START, {
      city: ["Row House", "Fire Station"],
      projects: ["quality", "quality"],
      combosClaimed: [{ card: "Row House", combo: 0, times: 2 }],
    });
    const found = invariantViolations(transition(START, { type: "end_turn", seat: 1 }, after)).filter(
      (violation) => violation.startsWith("I12") || violation.startsWith("I14"),
    );
    expect(found).toEqual([
      "I12: seat 1 completed the quality project more than once",
      "I14: seat 1 claimed Row House combo 1 2 times",
    ]);
  });

  it("reports an influence action used more often than its limit per game", () => {
    const after = withSeat1(START, { influenceUses: { influence_to_build_pass: 2, influence_to_funds: 1 } });
    expect(invariantViolations(transition(START, { type: "end_turn", seat: 1 }, after))).toEqual([
      "I11: seat 1 used influence_to_build_pass 2 times",
    ]);
  });

  it("reports a time bank that grows or leaves 0 to 15 minutes", () => {
    const grown = withSeat1(START, { timeBankMs: 900_001 });
    const spent = withSeat1(START, { timeBankMs: 1_000 });
    const found = [
      ...invariantViolations(transition(START, { type: "end_turn", seat: 1 }, grown)),
      ...invariantViolations(transition(spent, { type: "end_turn", seat: 1 }, START)),
    ].filter((violation) => violation.startsWith("I19"));
    expect(found).toEqual([
      "I19: seat 1 time bank went from 900000 to 900001",
      "I19: seat 1 time bank went from 1000 to 900000",
    ]);
  });

  it("allows a time bank to grow by at most the free time when its player ends their turn", () => {
    const spent = withSeat1(START, { timeBankMs: 600_000 });
    const refilled = withSeat1(START, { timeBankMs: 765_000 });
    const overfilled = withSeat1(START, { timeBankMs: 765_001 });
    const found = [
      ...invariantViolations(transition(spent, { type: "end_turn", seat: 1 }, refilled)),
      ...invariantViolations(transition(spent, { type: "end_turn", seat: 1 }, overfilled)),
      ...invariantViolations(transition(spent, { type: "end_turn", seat: 2 }, refilled)),
    ].filter((violation) => violation.startsWith("I19"));
    expect(found).toEqual([
      "I19: seat 1 time bank went from 600000 to 765001",
      "I19: seat 1 time bank went from 600000 to 765000",
    ]);
  });

  it("reports a turn that starts with the wrong first player", () => {
    const after = withEndOfTurnFundsPaid({ ...START, turn: 2, firstPlayer: 1 as const });
    expect(invariantViolations(transition(START, { type: "end_turn", seat: 1 }, after))).toEqual([
      "I20: turn 2 starts with seat 1 first",
    ]);
  });

  it("expects the next seat still in the game when the rotation seat has left", () => {
    const leftSeat2 = {
      ...START,
      turn: 2,
      seats: START.seats.map((seat) => (seat.seat === 2 ? { ...seat, departure: { turn: 1, cardsInHand: 0 } } : seat)),
    };
    const [seat1First, seat2First] = ([1, 2] as const).map((firstPlayer) =>
      invariantViolations(
        transition(START, { type: "end_turn", seat: 1 }, { ...leftSeat2, firstPlayer }),
      ).filter((violation) => violation.startsWith("I20")),
    );
    expect(seat1First).toEqual([]);
    expect(seat2First).toEqual(["I20: turn 2 starts with seat 2 first"]);
  });

  it("reports a marketplace place listed twice", () => {
    const residential = START.marketplace.find((slot) => slot.place === "residential");
    const after = {
      ...START,
      marketplace: [
        ...START.marketplace,
        ...(residential === undefined ? [] : [{ ...residential, card: null }]),
      ],
    };
    const found = invariantViolations(transition(START, { type: "end_turn", seat: 1 }, after)).filter(
      (violation) => violation.startsWith("I3"),
    );
    expect(found).toEqual([
      "I3: the marketplace has 9 places",
      "I3: the residential place is listed more than once",
    ]);
  });

  it("reports a quest completed twice, in two places, or missing", () => {
    const [first, second] = START.questList;
    const after = {
      ...withSeat1(START, { questsCompleted: ["Supply chain", "Supply chain"] }),
      questList: START.questList.filter((quest) => quest !== first && quest !== "Supply chain"),
      quests: [...START.quests, ...(second === undefined ? [] : [{ quest: second, turnsOnTable: 1, isInExtraTurn: false }])],
    };
    const found = invariantViolations(transition(START, { type: "end_turn", seat: 1 }, after)).filter(
      (violation) => /^I1[25]/.test(violation),
    );
    expect(found).toEqual([
      "I12: seat 1 completed Supply chain more than once",
      `I15: ${String(first)} is in 0 places`,
      `I15: ${String(second)} is in 2 places`,
    ]);
  });

  it("reports a quest too long on the table, placed too early, or a fifth place too soon", () => {
    const after = {
      ...START,
      turn: 4,
      quests: [
        ...START.quests.slice(0, 3),
        { quest: "Safe streets" as const, turnsOnTable: 1, isInExtraTurn: false },
        { quest: "Metropolis" as const, turnsOnTable: 6, isInExtraTurn: false },
      ],
      questList: START.questList.filter((quest) => quest !== "Safe streets" && quest !== "Metropolis"),
    };
    const found = invariantViolations(transition(START, { type: "end_turn", seat: 1 }, after)).filter(
      (violation) => violation.startsWith("I16"),
    );
    expect(found).toEqual([
      "I16: the quests table has 5 places in turn 4",
      "I16: Safe streets of tier 2 was placed in turn 4",
      "I16: Metropolis has been on the table for 6 turns",
      "I16: Metropolis of tier 3 was placed in turn -1",
    ]);
  });

  it("reports a kind place holding another kind and a card shown too long", () => {
    const after = {
      ...START,
      marketplace: START.marketplace.map((slot) =>
        slot.place === "residential" ? { ...slot, card: "Pub" as const, phasesShown: 3 } : slot,
      ),
      deck: START.deck.filter((card) => card !== "Pub"),
    };
    const found = invariantViolations(transition(START, { type: "end_turn", seat: 1 }, after)).filter(
      (violation) => violation.startsWith("I3") || violation.startsWith("I4"),
    );
    expect(found).toEqual([
      "I3: the residential place holds Pub",
      "I4: Pub has been on display during 3 market phases",
    ]);
  });
});
