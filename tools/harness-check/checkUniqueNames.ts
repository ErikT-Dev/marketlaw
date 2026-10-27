import type { HarnessFiles } from "./HarnessFiles.ts";
import type { HarnessProblem } from "./HarnessProblem.ts";
import { isRecord } from "./isRecord.ts";

export function checkUniqueNames(files: HarnessFiles): ReadonlyArray<HarnessProblem> {
  return files.scenarioFiles.flatMap((scenarioFile) => {
    const names = scenarioFile.scenarios.flatMap((scenario) =>
      isRecord(scenario) && typeof scenario["name"] === "string" ? [scenario["name"]] : [],
    );
    return names
      .filter((name, index) => names.indexOf(name) !== index)
      .map((name) => ({
        file: scenarioFile.path,
        where: name,
        message: "another scenario in this file has the same name",
      }));
  });
}
