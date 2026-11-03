import { describe, expect, it } from "vitest";
import { NO_GAMES } from "../simulator/NO_GAMES.ts";
import { SIMULATED_GAMES } from "./SIMULATED_GAMES.ts";
import { simulationProblems } from "./simulationProblems.ts";

describe("simulationProblems", () => {
  it("fails when fewer games were played than the check asks for", () => {
    const games = SIMULATED_GAMES.check - 1;
    expect(simulationProblems({ ...NO_GAMES, games }, ["I1"])).toEqual([
      `the simulator played ${String(games)} games, fewer than ${String(SIMULATED_GAMES.check)}`,
    ]);
  });

  it("fails a required invariant broken in a simulated game, with its shortest game", () => {
    const simulation = {
      ...NO_GAMES,
      games: 10_000,
      violationCounts: { I9: 2 },
      shortestViolations: [
        {
          invariant: "I9",
          message: "I9: seat 2 could still take income",
          seed: 17,
          players: 3 as const,
          bot: "chaos" as const,
          messages: ["{}", "{}"],
        },
      ],
    };
    expect(simulationProblems(simulation, ["I1", "I9"])).toEqual([
      "required I9 broken in 2 of 10000 simulated games; shortest: seed 17, 3 players, chaos bot, 2 messages: I9: seat 2 could still take income",
    ]);
  });
});
