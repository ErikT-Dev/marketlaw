import { isRecord } from "../harness-check/isRecord.ts";
import type { ScenarioFile } from "../harness-check/ScenarioFile.ts";
import { fileKeyOf } from "./fileKeyOf.ts";
import { RANDOM_KINDS } from "./RandomKind.ts";
import type { RandomEntry } from "./RandomEntry.ts";
import type { Scenario } from "./Scenario.ts";
import type { ScenarioStep } from "./ScenarioStep.ts";

function recordOrEmpty(value: unknown): Readonly<Record<string, unknown>> {
  return isRecord(value) ? value : {};
}

function randomEntriesOf(given: Readonly<Record<string, unknown>>): ReadonlyArray<RandomEntry> {
  const listed = Array.isArray(given["random"]) ? given["random"] : [];
  return listed.flatMap((entry: unknown) =>
    Object.entries(recordOrEmpty(entry)).flatMap(([key, value]) => {
      const kind = RANDOM_KINDS.find((known) => known === key);
      return kind === undefined ? [] : [{ kind, value }];
    }),
  );
}

function stepsOf(when: unknown): ReadonlyArray<ScenarioStep> {
  const steps: ReadonlyArray<unknown> = Array.isArray(when) ? when : [];
  return steps.flatMap((step): ReadonlyArray<ScenarioStep> => {
    if (step === "start_game") {
      return [step];
    }
    return isRecord(step) ? [step] : [];
  });
}

export function readScenarios(scenarioFiles: ReadonlyArray<ScenarioFile>): ReadonlyArray<Scenario> {
  return scenarioFiles.flatMap((scenarioFile) =>
    scenarioFile.scenarios.filter(isRecord).map((scenario, index) => {
      const given = Object.fromEntries(
        Object.entries(recordOrEmpty(scenario["given"])).filter(([field]) => field !== "random"),
      );
      return {
        file: fileKeyOf(scenarioFile.path),
        number: index + 1,
        name: typeof scenario["name"] === "string" ? scenario["name"] : `scenario ${index + 1}`,
        covers: Array.isArray(scenario["covers"])
          ? scenario["covers"].filter((rule): rule is string => typeof rule === "string")
          : [],
        given,
        random: randomEntriesOf(recordOrEmpty(scenario["given"])),
        when: stepsOf(scenario["when"]),
        then: recordOrEmpty(scenario["then"]),
      };
    }),
  );
}
