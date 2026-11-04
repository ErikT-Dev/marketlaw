import type { ScenarioFile } from "../harness-check/ScenarioFile.ts";
import { readScenarios } from "./readScenarios.ts";
import type { RequiredList } from "./RequiredList.ts";
import { runScenario } from "./runScenario.ts";
import type { ScenarioDriver } from "./ScenarioDriver.ts";
import type { ScenarioRun } from "./ScenarioRun.ts";

export async function buildScenarioRuns(
  scenarioFiles: ReadonlyArray<ScenarioFile>,
  required: RequiredList,
  drivers: ReadonlyArray<ScenarioDriver>,
): Promise<ReadonlyArray<ScenarioRun>> {
  return Promise.all(
    readScenarios(scenarioFiles).map(async (scenario) => ({
      scenario,
      ...(await runScenario(scenario, drivers)),
      isRequired: required.scenarios.some(
        ({ file, name }) => file === scenario.file && name === scenario.name,
      ),
    })),
  );
}
