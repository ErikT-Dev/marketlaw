import { collectHarnessCodes } from "./collectHarnessCodes.ts";
import { collectKnownNames } from "./collectKnownNames.ts";
import { forEachScenario } from "./forEachScenario.ts";
import type { HarnessFiles } from "./HarnessFiles.ts";
import type { HarnessProblem } from "./HarnessProblem.ts";
import { HARNESS_PATHS } from "./HARNESS_PATHS.ts";
import { isRecord } from "./isRecord.ts";

export function checkCodesAndActions(files: HarnessFiles): ReadonlyArray<HarnessProblem> {
  const codes = collectHarnessCodes(files.harnessText);
  const { trades } = collectKnownNames(files);
  const problems: HarnessProblem[] = [];
  forEachScenario(files, ({ file, name, scenario }) => {
    const then = scenario["then"];
    if (
      isRecord(then) &&
      typeof then["rejected"] === "string" &&
      !codes.reasonCodes.has(then["rejected"])
    ) {
      problems.push({
        file,
        where: name,
        message: `reason code "${then["rejected"]}" is not listed in HARNESS.md`,
      });
    }
    const steps = Array.isArray(scenario["when"]) ? scenario["when"] : [];
    for (const step of steps) {
      if (!isRecord(step)) {
        continue;
      }
      if (typeof step["action"] === "string" && !codes.actions.has(step["action"])) {
        problems.push({
          file,
          where: name,
          message: `action "${step["action"]}" is not listed in HARNESS.md`,
        });
      }
      if (typeof step["trade"] === "string" && !trades.has(step["trade"])) {
        problems.push({
          file,
          where: name,
          message: `influence trade "${step["trade"]}" is not in ${HARNESS_PATHS.influenceActions}`,
        });
      }
    }
  });
  return problems;
}
