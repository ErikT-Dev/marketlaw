import type { ScenarioFile } from "../harness-check/ScenarioFile.ts";
import { readScenarios } from "./readScenarios.ts";
import type { RequiredList } from "./RequiredList.ts";
import { runScenario } from "./runScenario.ts";
import type { ScenarioDriver } from "./ScenarioDriver.ts";
import type { ScenarioRun } from "./ScenarioRun.ts";

export function buildScenarioRuns(
  scenarioFiles: ReadonlyArray<ScenarioFile>,
  required: RequiredList,
  drivers: ReadonlyArray<ScenarioDriver>,
): ReadonlyArray<ScenarioRun> {
  return readScenarios(scenarioFiles).map((scenario) => ({
    scenario,
    result: runScenario(scenario, drivers),
    isRequired: required.scenarios.some(
      ({ file, name }) => file === scenario.file && name === scenario.name,
    ),
  }));
}
