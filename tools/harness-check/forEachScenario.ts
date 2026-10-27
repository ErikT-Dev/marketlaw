import type { HarnessFiles } from "./HarnessFiles.ts";
import { isRecord } from "./isRecord.ts";

type ScenarioVisit = {
  readonly file: string;
  readonly name: string;
  readonly scenario: Readonly<Record<string, unknown>>;
};

export function forEachScenario(
  files: HarnessFiles,
  visit: (scenario: ScenarioVisit) => void,
): void {
  for (const scenarioFile of files.scenarioFiles) {
    for (const scenario of scenarioFile.scenarios) {
      if (!isRecord(scenario)) {
        continue;
      }
      const name = typeof scenario["name"] === "string" ? scenario["name"] : "unnamed scenario";
      visit({ file: scenarioFile.path, name, scenario });
    }
  }
}
