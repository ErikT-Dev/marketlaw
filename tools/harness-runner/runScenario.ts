import type { Scenario } from "./Scenario.ts";
import type { ScenarioDriver } from "./ScenarioDriver.ts";
import type { BudgetMeasurement } from "./BudgetMeasurement.ts";
import type { ScenarioOutcome } from "./ScenarioOutcome.ts";
import { ScriptedRandom } from "./ScriptedRandom.ts";
import { findMismatches } from "./findMismatches.ts";
import { stepKindOf } from "./stepKindOf.ts";
import { unhandledNestedFields } from "./unhandledNestedFields.ts";

function missingFor(scenario: Scenario, driver: ScenarioDriver): ReadonlyArray<string> {
  return [
    ...Object.keys(scenario.given)
      .filter((field) => !driver.givenFields.has(field))
      .map((field) => `given ${field}`),
    ...scenario.when
      .map(stepKindOf)
      .filter((kind) => !driver.steps.has(kind))
      .map((kind) => `step ${kind}`),
    ...Object.keys(scenario.then)
      .filter((field) => !driver.thenFields.has(field))
      .map((field) => `then ${field}`),
    ...unhandledNestedFields(scenario, driver.nestedFields),
    ...driver.unhandledGivenValues(scenario.given),
  ];
}

type Played = {
  readonly problems: ReadonlyArray<string>;
  readonly measurements: ReadonlyArray<BudgetMeasurement>;
};

function play(scenario: Scenario, driver: ScenarioDriver): Played {
  const random = new ScriptedRandom(scenario.random);
  try {
    const session = driver.startSession(scenario.given, random);
    for (const step of scenario.when) {
      session.runStep(step);
    }
    const mismatches = Object.entries(scenario.then).flatMap(([field, expected]) =>
      findMismatches(expected, session.readThen(field, expected), `then.${field}`),
    );
    return {
      problems: [...mismatches, ...random.problems()],
      measurements: session.measurements?.() ?? [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { problems: [`the ${driver.name} driver stopped: ${message}`], measurements: [] };
  }
}

export function runScenario(
  scenario: Scenario,
  drivers: ReadonlyArray<ScenarioDriver>,
): ScenarioOutcome {
  const candidates = drivers.map((driver) => ({ driver, missing: missingFor(scenario, driver) }));
  const ready = candidates.find(({ missing }) => missing.length === 0);
  if (ready === undefined) {
    const fewestMissing = [...candidates].sort((a, b) => a.missing.length - b.missing.length)[0];
    return {
      result: { status: "not_yet", missing: fewestMissing?.missing ?? ["a driver"] },
      measurements: [],
    };
  }
  const { problems, measurements } = play(scenario, ready.driver);
  return {
    result: problems.length === 0 ? { status: "passes" } : { status: "fails", problems },
    measurements,
  };
}
