import { describe, expect, it } from "vitest";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import type { CardName } from "../shared/catalogue/CardName";
import type { GameState } from "./GameState";
import type { SeatState } from "./SeatState";
import { STARTING_STATS } from "./STARTING_STATS";
import { startSavedGame } from "./startSavedGame";
import { viewFor } from "./viewFor";

function gameWithSeatOne(turn: number, changes: Partial<SeatState>): GameState {
  const state = startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 3).state;
  return {
    ...state,
    turn,
    seats: state.seats.map((seat) => (seat.seat === 1 ? { ...seat, ...changes } : seat)),
  };
}

function ownViewOf(state: GameState) {
  const own = viewFor(state, 1).seats.find((seat) => seat.kind === "own");
  if (own?.kind !== "own") {
    throw new Error("no own seat in the view");
  }
  return own;
}

function detailsOf(state: GameState) {
  return ownViewOf(state).handDetails;
}

const HAND: ReadonlyArray<CardName> = ["Farm House", "Dorm", "Fishing Industry"];

describe("hand card details in the own view", () => {
  it("gives each hand card its real cost and the cards of its sector and tier already in the city", () => {
    const state = gameWithSeatOne(5, { hand: HAND, city: ["Cottage", "Log House"], stats: { ...STARTING_STATS, funds: 20 } });
    expect(detailsOf(state).map(({ card, realCost, sameSectorAndTierInCity }) => [card, realCost, sameSectorAndTierInCity])).toEqual([
      ["Farm House", 60, 2],
      ["Dorm", 90, 0],
      ["Fishing Industry", 80, 0],
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
      stats: { ...STARTING_STATS, funds: 60 },
    });
    expect(detailsOf(state).map(({ realCost, playRejection }) => [realCost, playRejection])).toEqual([
      [70, "not_enough_funds"],
    ]);
  });

  it("says whether selling and ending the turn would be accepted", () => {
    const playing = ownViewOf(gameWithSeatOne(1, {}));
    expect([playing.sellRejection, playing.endTurnRejection]).toEqual([null, null]);
    const atLimit = ownViewOf(gameWithSeatOne(1, { hand: ["Farm House"], actionsThisTurn: 50 }));
    expect(atLimit.handDetails.map(({ playRejection }) => playRejection)).toEqual([
      "action_limit_reached",
    ]);
    expect([atLimit.sellRejection, atLimit.endTurnRejection]).toEqual(["action_limit_reached", null]);
    const done = ownViewOf(gameWithSeatOne(1, { isDone: true }));
    expect([done.sellRejection, done.endTurnRejection]).toEqual(["already_done", "already_done"]);
  });
});
