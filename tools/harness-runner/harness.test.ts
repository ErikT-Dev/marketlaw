import { describe, expect, it } from "vitest";
import { DRIVERS } from "./DRIVERS.ts";
import { PHASE_END_RUN } from "./PHASE_END_RUN.ts";
import { runHarness } from "./runHarness.ts";
import { SIMULATED_GAMES } from "./SIMULATED_GAMES.ts";

const SIMULATED_GAME_COUNT =
  process.env[PHASE_END_RUN.variable] === PHASE_END_RUN.value
    ? SIMULATED_GAMES.phaseEnd
    : SIMULATED_GAMES.check;

const OUTCOME = await runHarness(DRIVERS, SIMULATED_GAME_COUNT);

describe("the harness", () => {
  it("reads all 459 scenarios", () => {
    expect(OUTCOME.run.runs).toHaveLength(459);
  });

  it("simulates every game it was asked for", () => {
    expect(OUTCOME.run.simulation.games).toBe(SIMULATED_GAME_COUNT);
  });

  it("passes everything on the required list", () => {
    expect(OUTCOME.problems).toEqual([]);
  });
});
