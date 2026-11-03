import { describe, expect, it } from "vitest";
import type { RandomEntry } from "./RandomEntry.ts";
import type { Scenario } from "./Scenario.ts";
import type { ScenarioDriver } from "./ScenarioDriver.ts";
import { runScenario } from "./runScenario.ts";
import type { ScenarioResult } from "./ScenarioResult.ts";

const COUNTER_DRIVER: ScenarioDriver = {
  name: "counter",
  givenFields: new Set(["turn"]),
  steps: new Set(["start_game", "end_turn", "draw", "crash"]),
  thenFields: new Set(["turn", "drawn", "seats"]),
  nestedFields: new Map([["then.seats", new Set(["seat", "stats"])]]),
  unhandledGivenValues: () => [],
  startSession(given, random) {
    let turn = typeof given["turn"] === "number" ? given["turn"] : 1;
    const drawn: unknown[] = [];
    return {
      runStep(step) {
        if (step === "start_game") {
          drawn.push(random.next("sector", "setup"));
          return;
        }
        if (step["action"] === "crash") {
          throw new Error("no such card");
        }
        if (step["action"] === "draw") {
          drawn.push(random.next("sector", "play"));
          return;
        }
        turn += 1;
      },
      readThen(field) {
        if (field === "seats") {
          return [{ seat: 1, stats: { funds: 5, income: 1 } }];
        }
        return field === "turn" ? turn : drawn;
      },
    };
  },
};

function scenario(parts: Partial<Scenario>): Scenario {
  return {
    file: "test",
    number: 1,
    name: "a test scenario",
    covers: ["R1.1"],
    given: {},
    random: [],
    when: [],
    then: { turn: 1 },
    ...parts,
  };
}

function sectors(...names: ReadonlyArray<string>): ReadonlyArray<RandomEntry> {
  return names.map((value) => ({ kind: "sector", value }));
}

function resultOf(...args: Parameters<typeof runScenario>): ScenarioResult {
  return runScenario(...args).result;
}

describe("runScenario", () => {
  it("reports a scenario as not yet when there is no driver", () => {
    expect(resultOf(scenario({}), [])).toEqual({
      status: "not_yet",
      missing: ["a driver"],
    });
  });

  it("reports what the driver cannot do yet", () => {
    const result = resultOf(
      scenario({ given: { room: {} }, when: [{ seat: 1, action: "sell" }], then: { ended: {} } }),
      [COUNTER_DRIVER],
    );
    expect(result).toEqual({
      status: "not_yet",
      missing: ["given room", "step sell", "then ended"],
    });
  });

  it("reports nested fields the driver cannot do yet", () => {
    const result = resultOf(scenario({ then: { seats: [{ seat: 1, connected: false }] } }), [
      COUNTER_DRIVER,
    ]);
    expect(result).toEqual({ status: "not_yet", missing: ["then seats.connected"] });
  });

  it("passes a scenario whose then fields match", () => {
    const result = resultOf(
      scenario({ given: { turn: 3 }, when: [{ seat: 1, action: "end_turn" }], then: { turn: 4 } }),
      [COUNTER_DRIVER],
    );
    expect(result).toEqual({ status: "passes" });
  });

  it("does not check fields the scenario does not mention", () => {
    const result = resultOf(scenario({ then: { seats: [{ seat: 1, stats: { funds: 5 } }] } }), [
      COUNTER_DRIVER,
    ]);
    expect(result).toEqual({ status: "passes" });
  });

  it("fails a scenario whose then field differs", () => {
    expect(resultOf(scenario({ then: { turn: 2 } }), [COUNTER_DRIVER])).toEqual({
      status: "fails",
      problems: ["then.turn: expected 2, got 1"],
    });
  });

  it("compares lists exactly including their length", () => {
    expect(resultOf(scenario({ then: { seats: [] } }), [COUNTER_DRIVER])).toEqual({
      status: "fails",
      problems: ['then.seats: expected [], got [{"seat":1,"stats":{"funds":5,"income":1}}]'],
    });
  });

  it("supplies listed random results in order", () => {
    const result = resultOf(
      scenario({
        random: sectors("Industry", "Service"),
        when: [
          { seat: 1, action: "draw" },
          { seat: 1, action: "draw" },
        ],
        then: {
          drawn: [
            { kind: "listed", value: "Industry" },
            { kind: "listed", value: "Service" },
          ],
        },
      }),
      [COUNTER_DRIVER],
    );
    expect(result).toEqual({ status: "passes" });
  });

  it("fails a scenario that does not list a random result the rules ask for", () => {
    const result = resultOf(scenario({ when: [{ seat: 1, action: "draw" }] }), [COUNTER_DRIVER]);
    expect(result).toEqual({
      status: "fails",
      problems: ["the rules asked for a random sector the scenario does not list"],
    });
  });

  it("lets setup use random results the scenario does not list", () => {
    const result = resultOf(scenario({ when: ["start_game"] }), [COUNTER_DRIVER]);
    expect(result).toEqual({ status: "passes" });
  });

  it("keeps listed play results for play when setup lists none", () => {
    const result = resultOf(
      scenario({
        random: [{ kind: "tier", value: 2 }],
        when: ["start_game", { seat: 1, action: "draw" }],
      }),
      [COUNTER_DRIVER],
    );
    expect(result).toEqual({
      status: "fails",
      problems: ["the rules asked for a random sector, but random result 1 is a tier"],
    });
  });

  it("fails when a listed random result is of another kind", () => {
    const result = resultOf(
      scenario({ random: [{ kind: "tier", value: 2 }], when: [{ seat: 1, action: "draw" }] }),
      [COUNTER_DRIVER],
    );
    expect(result).toEqual({
      status: "fails",
      problems: ["the rules asked for a random sector, but random result 1 is a tier"],
    });
  });

  it("fails when listed random results are never asked for", () => {
    const result = resultOf(scenario({ random: sectors("Industry") }), [COUNTER_DRIVER]);
    expect(result).toEqual({
      status: "fails",
      problems: ["1 listed random results were never asked for"],
    });
  });

  it("fails a scenario when the driver stops with an error", () => {
    const result = resultOf(scenario({ when: [{ seat: 1, action: "crash" }] }), [COUNTER_DRIVER]);
    expect(result).toEqual({
      status: "fails",
      problems: ["the counter driver stopped: no such card"],
    });
  });
});
