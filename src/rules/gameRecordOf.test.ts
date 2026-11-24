import { describe, expect, it } from "vitest";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import { endGame } from "./endGame";
import { gameRecordOf } from "./gameRecordOf";
import type { GameState } from "./GameState";
import { leaveGame } from "./leaveGame";
import { SAVE_SCHEMA_VERSION } from "./SAVE_SCHEMA_VERSION";
import type { SavedGame } from "./SavedGame";
import { seededRandom } from "./seededRandom";
import { setUpGame } from "./setUpGame";
import type { SeatState } from "./SeatState";

const RANDOM = seededRandom(25, 0);

function savedWith(state: GameState): SavedGame {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    seed: 25,
    setup: { players: 2, kind: "casual", startedAt: GAME_STARTED_AT },
    startingState: null,
    actionLog: [],
    state,
  };
}

function gameOf(players: 2 | 3, turn: number, changes: Partial<SeatState>): GameState {
  const started = setUpGame({ players, kind: "casual", startedAt: GAME_STARTED_AT }, RANDOM);
  return {
    ...started,
    turn,
    phase: "main",
    bonusTypes: ["Finance", "Office"],
    seats: started.seats.map((seat) =>
      seat.seat === 2 ? { ...seat, hand: [], city: [], gainedTypes: {}, ...changes } : seat,
    ),
  };
}

describe("gameRecordOf", () => {
  it("records every seat's result and values in place order", () => {
    const state = gameOf(2, 40, {
      stats: {
        funds: 100,
        income: 15,
        influence: 4,
        workforce: 3,
        quality: 2,
        satisfaction: -1,
        product: 1,
        distribution: 2,
      },
      gainedTypes: { Farm: 2 },
      projects: ["workforce"],
      questsCompleted: ["Farmland", "Countryside"],
      combosClaimed: [
        { card: "Countryside Stone House", combo: 0, times: 3 },
        { card: "Fast Food Restaurant", combo: 1, times: 1 },
      ],
    });
    const record = gameRecordOf(savedWith(endGame(state, 0, "turn_limit")));
    expect(record?.turns).toBe(40);
    expect(record?.winner).toBe(2);
    expect(record?.bonusTypes).toEqual(["Finance", "Office"]);
    expect(record?.seats.map(({ seat, result, place }) => [seat, result, place])).toEqual([
      [2, "won", 1],
      [1, "lost", 2],
    ]);
    expect(record?.seats[0]).toEqual({
      seat: 2,
      result: "won",
      place: 1,
      leftInTurn: null,
      score: 109,
      hasReachedEndGoal: false,
      income: 15,
      fundsAndHand: 10,
      workforce: 3,
      quality: 2,
      satisfaction: -1,
      product: 1,
      distribution: 2,
      influence: 4,
      bonusTypePoints: 0,
      projects: ["workforce"],
      questsCompleted: 2,
      comboGains: { workforce: 0, quality: 3, satisfaction: 1 },
      typeCounts: { Farm: 2 },
      counts: { questsCompleted: 2, types: 2, combosClaimed: 4, worthGained: 140 },
    });
  });

  it("scores a seat that left with the turn and the cards in hand it left with", () => {
    const state = gameOf(3, 12, { hand: ["Pub", "Library"] });
    const left = leaveGame(state, 2, RANDOM, 0);
    const record = gameRecordOf(savedWith(endGame({ ...left, turn: 20 }, 0, "turn_limit")));
    expect(record?.turns).toBe(20);
    expect(record?.seats[2]).toMatchObject({
      seat: 2,
      result: "left",
      place: 3,
      leftInTurn: 12,
      score: 21,
      fundsAndHand: 9,
    });
  });

  it("saves no record for a game still going or abandoned", () => {
    const state = gameOf(2, 5, {});
    expect(gameRecordOf(savedWith(state))).toBeNull();
    expect(gameRecordOf(savedWith(endGame(state, 0, "abandoned_by_vote")))).toBeNull();
    expect(gameRecordOf(savedWith(endGame(state, 0, "paused_too_long")))).toBeNull();
  });
});
