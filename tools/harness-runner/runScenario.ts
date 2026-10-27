import type { Scenario } from "./Scenario.ts";
import type { ScenarioDriver } from "./ScenarioDriver.ts";
import type { ScenarioResult } from "./ScenarioResult.ts";
import { ScriptedRandom } from "./ScriptedRandom.ts";
import { findMismatches } from "./findMismatches.ts";
import { stepKindOf } from "./stepKindOf.ts";

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
  ];
}

function play(scenario: Scenario, driver: ScenarioDriver): ReadonlyArray<string> {
  const random = new ScriptedRandom(scenario.random);
  try {
    const session = driver.startSession(scenario.given, random);
    for (const step of scenario.when) {
      session.runStep(step);
    }
    const mismatches = Object.entries(scenario.then).flatMap(([field, expected]) =>
      findMismatches(expected, session.readThen(field, expected), `then.${field}`),
    );
    return [...mismatches, ...random.problems()];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [`the ${driver.name} driver stopped: ${message}`];
  }
}

export function runScenario(
  scenario: Scenario,
  drivers: ReadonlyArray<ScenarioDriver>,
): ScenarioResult {
  const candidates = drivers.map((driver) => ({ driver, missing: missingFor(scenario, driver) }));
  const ready = candidates.find(({ missing }) => missing.length === 0);
  if (ready === undefined) {
    const fewestMissing = [...candidates].sort((a, b) => a.missing.length - b.missing.length)[0];
    return { status: "not_yet", missing: fewestMissing?.missing ?? ["no driver yet"] };
  }
  const problems = play(scenario, ready.driver);
  return problems.length === 0 ? { status: "passes" } : { status: "fails", problems };
}
