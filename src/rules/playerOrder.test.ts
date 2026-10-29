import { describe, expect, it } from "vitest";
import { firstPlayerOf } from "./firstPlayerOf";
import type { GameState } from "./GameState";
import { startSavedGame } from "./startSavedGame";
import { viewFor } from "./viewFor";

function gameAt(players: 2 | 3 | 4, turn: number, seatsThatLeft: ReadonlyArray<number>): GameState {
  const state = startSavedGame({ players }, 5).state;
  const seats = state.seats.map((seat) => ({
    ...seat,
    hasLeft: seatsThatLeft.includes(seat.seat),
  }));
  return { ...state, turn, firstPlayer: firstPlayerOf(turn, seats), seats };
}

describe("player order in the view", () => {
  it("starts from seat 1 in turn 1 and goes up by seat number", () => {
    expect(viewFor(gameAt(3, 1, []), 1).playerOrder).toEqual([1, 2, 3]);
  });

  it("moves the first player one seat on each turn and wraps to seat 1", () => {
    expect(viewFor(gameAt(3, 3, []), 2).playerOrder).toEqual([3, 1, 2]);
    expect(viewFor(gameAt(3, 4, []), 2).playerOrder).toEqual([1, 2, 3]);
  });

  it("lets the next seat still in the game go first when the first player has left", () => {
    expect(viewFor(gameAt(4, 6, [2]), 1).playerOrder).toEqual([3, 4, 1]);
  });

  it("skips players who left and wraps from the highest seat", () => {
    expect(viewFor(gameAt(4, 4, [1]), 2).playerOrder).toEqual([4, 2, 3]);
  });
});
