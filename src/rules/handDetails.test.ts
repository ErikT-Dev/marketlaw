import { describe, expect, it } from "vitest";
import type { CardName } from "../shared/catalogue/CardName";
import type { GameState } from "./GameState";
import type { SeatState } from "./SeatState";
import { STARTING_STATS } from "./STARTING_STATS";
import { startSavedGame } from "./startSavedGame";
import { viewFor } from "./viewFor";

function gameWithSeatOne(turn: number, changes: Partial<SeatState>): GameState {
  const state = startSavedGame({ players: 2 }, 3).state;
  return {
    ...state,
    turn,
    seats: state.seats.map((seat) => (seat.seat === 1 ? { ...seat, ...changes } : seat)),
  };
}

function detailsOf(state: GameState) {
  const own = viewFor(state, 1).seats.find((seat) => seat.kind === "own");
  return own?.kind === "own" ? own.handDetails : [];
}

const HAND: ReadonlyArray<CardName> = ["Farm House", "Dorm", "Fishing Industry"];

describe("hand card details in the own view", () => {
  it("gives each hand card its real cost and the cards of its sector and tier already in the city", () => {
    const state = gameWithSeatOne(5, { hand: HAND, city: ["Cottage", "Log House"], stats: { ...STARTING_STATS, funds: 20 } });
    expect(detailsOf(state).map(({ card, realCost, sameSectorAndTierInCity }) => [card, realCost, sameSectorAndTierInCity])).toEqual([
      ["Farm House", 6, 2],
      ["Dorm", 9, 0],
      ["Fishing Industry", 8, 0],
    ]);
  });

  it("says why a card cannot be played, the same way a play would be rejected", () => {
    const state = gameWithSeatOne(1, { hand: ["Farm House", "Dorm", "Log House"], city: ["Cottage", "Loft"] });
    expect(detailsOf(state).map(({ card, playRejection }) => [card, playRejection])).toEqual([
      ["Farm House", null],
      ["Dorm", "tier_not_allowed"],
      ["Log House", null],
    ]);
  });

  it("marks every card unplayable once the player is done", () => {
    const state = gameWithSeatOne(1, { hand: ["Farm House"], isDone: true });
    expect(detailsOf(state).map(({ playRejection }) => playRejection)).toEqual(["already_done"]);
  });

  it("marks a card unplayable when funds do not cover its real cost", () => {
    const state = gameWithSeatOne(1, {
      hand: ["Log House"],
      city: ["Cottage", "Farm House"],
      stats: { ...STARTING_STATS, funds: 6 },
    });
    expect(detailsOf(state).map(({ realCost, playRejection }) => [realCost, playRejection])).toEqual([
      [7, "not_enough_funds"],
    ]);
  });
});
