import { describe, expect, it } from "vitest";
import { startSavedGame } from "../../src/rules/startSavedGame.ts";
import { mergeSummaries } from "./mergeSummaries.ts";
import { NO_GAMES } from "./NO_GAMES.ts";
import { replayViolations } from "./replayViolations.ts";
import { simulateGame } from "./simulateGame.ts";
import { simulateSlice } from "./simulateSlice.ts";

function failure(seed: number, messages: number) {
  return {
    ...NO_GAMES,
    games: 1,
    violationCounts: { I1: 1 },
    shortestViolations: [
      {
        invariant: "I1",
        message: "I1: Pub is in no place",
        seed,
        players: 2 as const,
        bot: "legal" as const,
        messages: Array.from({ length: messages }, () => "{}"),
      },
    ],
  };
}

describe("simulator", () => {
  it("plays legal games to the last turn with one row per accepted action and none otherwise", () => {
    const game = simulateGame(4, 3, "legal", 3);
    expect(game.violations).toEqual([]);
    expect(game.turnsPlayed).toBe(3);
    expect(new Set(game.rowsPerAcceptedAction)).toEqual(new Set([1]));
    expect(new Set(game.rowsPerOtherMessage)).toEqual(new Set([0]));
  });

  it("plays chaos games whose rejected messages change nothing", () => {
    const game = simulateGame(5, 2, "chaos", 3);
    expect(game.violations).toEqual([]);
    expect(game.rowsPerOtherMessage.length).toBeGreaterThan(game.rowsPerAcceptedAction.length);
  });

  it("covers every seat count and both bots in a slice", () => {
    const summary = simulateSlice(1, 6, 2);
    expect(summary.games).toBe(6);
    expect(summary.violationCounts).toEqual({});
  });

  it("catches a stored game that lost a card and stops the message list at the first failure", () => {
    const game = simulateGame(7, 2, "legal", 3, (record) =>
      record.game === null
        ? record
        : {
            ...record,
            game: {
              ...record.game,
              saved: {
                ...record.game.saved,
                state: { ...record.game.saved.state, deck: record.game.saved.state.deck.slice(1) },
              },
            },
          },
    );
    expect(game.violations.some((found) => found.startsWith("I1: "))).toBe(true);
    expect(game.firstViolationAt).not.toBeNull();
    expect(game.firstViolationAt).toBeLessThan(game.messages.length + 1);
  });

  it("reports a game whose replay differs", () => {
    const saved = startSavedGame({ players: 2 }, 3);
    const played = { ...saved, actionLog: [{ type: "end_turn" as const, seat: 1 as const }] };
    expect(replayViolations(played, ["not the state"])).toEqual([
      "I26: the state after action 1 differs on replay",
    ]);
  });

  it("keeps the shortest failing game for each invariant", () => {
    const merged = mergeSummaries([failure(1, 9), failure(2, 4), failure(3, 7)]);
    expect(merged.violationCounts).toEqual({ I1: 3 });
    expect(merged.shortestViolations.map(({ seed }) => seed)).toEqual([2]);
  });
});
