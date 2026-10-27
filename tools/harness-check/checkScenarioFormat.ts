import { Ajv } from "ajv";
import type { HarnessFiles } from "./HarnessFiles.ts";
import type { HarnessProblem } from "./HarnessProblem.ts";
import { scenarioNameAt } from "./scenarioNameAt.ts";

export function checkScenarioFormat(files: HarnessFiles): ReadonlyArray<HarnessProblem> {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(files.scenarioFormat ?? {});
  const problems: HarnessProblem[] = [];
  for (const scenarioFile of files.scenarioFiles) {
    if (validate(scenarioFile.scenarios)) {
      continue;
    }
    for (const error of validate.errors ?? []) {
      const extra =
        typeof error.params["additionalProperty"] === "string"
          ? `: ${error.params["additionalProperty"]}`
          : "";
      problems.push({
        file: scenarioFile.path,
        where: scenarioNameAt(scenarioFile.scenarios, error.instancePath),
        message: `${error.instancePath || "/"} ${error.message ?? "is not valid"}${extra}`,
      });
    }
  }
  return problems;
}
