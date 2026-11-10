import { describe, expect, it } from "vitest";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import { endGame } from "./endGame";
import type { GameState } from "./GameState";
import { invariantViolations } from "./invariantViolations";
import { seededRandom } from "./seededRandom";
import { setUpGame } from "./setUpGame";

const LEFT_IN_TURN_1 = { turn: 1, cardsInHand: 0 };
const START = setUpGame({ players: 2, startedAt: GAME_STARTED_AT }, seededRandom(21, 0));

function endingViolations(after: GameState): ReadonlyArray<string> {
  return invariantViolations({
    before: START,
    beforeAsText: JSON.stringify(START),
    action: { type: "leave_game", seat: 1 },
    outcome: { isOk: true, value: after },
  }).filter((violation) => violation.startsWith("I22"));
}

describe("places when players left", () => {
  it("places players who left last, the first to leave last of all", () => {
    const three = setUpGame({ players: 3, startedAt: GAME_STARTED_AT }, seededRandom(21, 0));
    const ended = endGame(
      {
        ...three,
        leaveOrder: [2, 3],
        seats: three.seats.map((seat) => (seat.seat === 1 ? seat : { ...seat, hasLeft: true, departure: LEFT_IN_TURN_1 })),
      },
      0,
      "last_player",
    );
    const places = ended.result?.places ?? [];
    expect(places.map(({ seat }) => seat)).toEqual([1, 3, 2]);
    expect(endingViolations(ended)).toEqual([]);
    const firstLeaverAhead = {
      ...ended,
      result: { endedBy: "last_player" as const, places: [...places].sort((a, b) => a.seat - b.seat) },
    };
    expect(endingViolations(firstLeaverAhead)).toEqual([
      "I22: the places are not in score order with players who left last, the first to leave last",
    ]);
  });

  it("expects a winner unless the game is abandoned", () => {
    const everyoneLeft = {
      ...START,
      leaveOrder: [1, 2] as const,
      seats: START.seats.map((seat) => ({ ...seat, hasLeft: true, departure: LEFT_IN_TURN_1 })),
    };
    expect(endingViolations(endGame(everyoneLeft, 0, "everyone_left"))).toEqual([]);
    expect(endingViolations(endGame(everyoneLeft, 0, "last_player"))).toEqual([
      "I22: the winner has left or there is none",
    ]);
  });
});
