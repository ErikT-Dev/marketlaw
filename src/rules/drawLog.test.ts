import { describe, expect, it } from "vitest";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import type { CardName } from "../shared/catalogue/CardName";
import { apply } from "./apply";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import { startSavedGame } from "./startSavedGame";
import { STARTING_STATS } from "./STARTING_STATS";
import { viewFor } from "./viewFor";

const PUBLIC_TIER_1: Random = {
  pickSector: () => "Public",
  pickTier: () => 1,
  pickQuest: (candidates) => candidates[0] ?? "Farmland",
  pickType: (candidates) => candidates[0] ?? "Farm",
  shuffle: (cards) => [...cards].reverse(),
};

function readyForIncome(
  deck: ReadonlyArray<CardName>,
  discard: ReadonlyArray<CardName>,
  product: number,
): GameState {
  const state = startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 9).state;
  return {
    ...state,
    deck,
    discard,
    seats: state.seats.map((seat) =>
      seat.seat === 1
        ? {
            ...seat,
            hand: ["Liquor Shop"],
            stats: { ...STARTING_STATS, workforce: 1, quality: 1, product },
          }
        : seat,
    ),
  };
}

function drawLogAfterPlaying(state: GameState) {
  const result = apply(state, { type: "play_card", seat: 1, card: "Liquor Shop" }, PUBLIC_TIER_1, GAME_STARTED_AT);
  if (!result.isOk) {
    throw new Error(`play rejected: ${result.error.code}`);
  }
  return viewFor(result.value, 1).drawLog;
}

describe("draw log after income", () => {
  it("records each income draw with who drew and what was asked for", () => {
    expect(drawLogAfterPlaying(readyForIncome(["Landfill"], [], 1))).toEqual([
      {
        kind: "draw",
        turn: 1,
        seat: 1,
        cause: "income",
        count: 1,
        asked: { by: "sector", sector: "Public", tier: 1 },
      },
    ]);
  });

  it("records a shuffle of matching discards before the draw it allowed", () => {
    expect(drawLogAfterPlaying(readyForIncome(["Pub"], ["Landfill", "Library"], 1))).toEqual([
      {
        kind: "shuffle",
        turn: 1,
        seat: 1,
        asked: { by: "sector", sector: "Public", tier: 1 },
        count: 2,
      },
      {
        kind: "draw",
        turn: 1,
        seat: 1,
        cause: "income",
        count: 1,
        asked: { by: "sector", sector: "Public", tier: 1 },
      },
    ]);
  });

  it("records a whole-pile shuffle when the deck is empty and nothing of the sector is left", () => {
    expect(drawLogAfterPlaying(readyForIncome([], ["Pub", "Dorm"], 1))).toEqual([
      { kind: "shuffle", turn: 1, seat: 1, asked: null, count: 2 },
      {
        kind: "draw",
        turn: 1,
        seat: 1,
        cause: "income",
        count: 1,
        asked: { by: "sector", sector: "Public", tier: 1 },
      },
    ]);
  });
});
