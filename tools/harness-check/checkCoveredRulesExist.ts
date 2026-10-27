import { collectDefinedRules } from "./collectDefinedRules.ts";
import { coversOf } from "./coversOf.ts";
import { forEachScenario } from "./forEachScenario.ts";
import type { HarnessFiles } from "./HarnessFiles.ts";
import type { HarnessProblem } from "./HarnessProblem.ts";

export function checkCoveredRulesExist(files: HarnessFiles): ReadonlyArray<HarnessProblem> {
  const defined = new Set(files.ruleSpecs.flatMap((spec) => collectDefinedRules(spec.text)));
  const problems: HarnessProblem[] = [];
  forEachScenario(files, ({ file, name, scenario }) => {
    for (const rule of coversOf(scenario)) {
      if (!defined.has(rule)) {
        problems.push({
          file,
          where: name,
          message: `covers ${rule}, which is not a rule in the specs`,
        });
      }
    }
  });
  return problems;
}
