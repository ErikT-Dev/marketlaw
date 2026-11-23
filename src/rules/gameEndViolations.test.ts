import { describe, expect, it } from "vitest";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import { endGame } from "./endGame";
import type { GameState } from "./GameState";
import { invariantViolations } from "./invariantViolations";
import { seededRandom } from "./seededRandom";
import { setUpGame } from "./setUpGame";

const START = setUpGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, seededRandom(21, 0));

function endingViolations(after: GameState): ReadonlyArray<string> {
  return invariantViolations({
    before: START,
    beforeAsText: JSON.stringify(START),
    action: { type: "end_turn", seat: 1 },
    outcome: { isOk: true, value: after },
  }).filter(
    (violation) => violation.startsWith("I22"),
  );
}

describe("gameEndViolations", () => {
  it("checks the score and places of a game that ends", () => {
    const ended = endGame({ ...START, turn: 40 }, 0);
    expect(endingViolations(ended)).toEqual([]);
    const places = ended.result?.places ?? [];
    const wrongScore = {
      ...ended,
      result: { endedBy: "turn_limit" as const, places: places.map((place) => ({ ...place, score: place.score + 1 })) },
    };
    expect(endingViolations(wrongScore)).toEqual([
      "I22: seat 1's score does not follow the formula",
      "I22: seat 2's score does not follow the formula",
    ]);
  });

  it("checks that equal scores are placed by total worth gained", () => {
    const ended = endGame(
      {
        ...START,
        turn: 40,
        seats: START.seats.map((seat) => (seat.seat === 2 ? { ...seat, worthGained: seat.worthGained + 10 } : seat)),
      },
      0,
    );
    const places = (ended.result?.places ?? []).map((place) => ({ ...place, score: 100 }));
    function placedAs(order: ReadonlyArray<number>) {
      return       endingViolations({
        ...ended,
        result: {
          endedBy: "turn_limit" as const,
          places: order.flatMap((seat) => places.filter((place) => place.seat === seat)),
        },
      }).filter((violation) => violation.includes("equal scores"));
    }
    expect(placedAs([1, 2])).toEqual([
      "I22: equal scores are not placed by total worth gained and then the player order",
    ]);
    expect(placedAs([2, 1])).toEqual([]);
  });

  it("checks that a player who reached the end goal is placed above a higher score", () => {
    const ended = endGame(
      {
        ...START,
        turn: 12,
        seats: START.seats.map((seat) =>
          seat.seat === 1
            ? {
                ...seat,
                stats: { ...seat.stats, income: 20 },
                projects: ["quality", "satisfaction", "workforce"] as const,
              }
            : { ...seat, stats: { ...seat.stats, income: 30 } },
        ),
      },
      0,
    );
    const places = ended.result?.places ?? [];
    expect(places.map((place) => place.seat)).toEqual([1, 2]);
    expect(endingViolations(ended)).toEqual([]);
    expect(
      endingViolations({
        ...ended,
        result: { endedBy: "end_goal" as const, places: [...places].reverse() },
      }),
    ).toEqual([
      "I22: the places are not by end goal and then score with players who left last, the first to leave last",
    ]);
  });
});
