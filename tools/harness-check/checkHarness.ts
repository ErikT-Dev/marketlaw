import { writeFileSync } from "node:fs";
import { buildCoverage } from "./buildCoverage.ts";
import { checkCodesAndActions } from "./checkCodesAndActions.ts";
import { checkCoveredRulesExist } from "./checkCoveredRulesExist.ts";
import { checkFieldsDocumented } from "./checkFieldsDocumented.ts";
import { checkNames } from "./checkNames.ts";
import { checkRulebookLinks } from "./checkRulebookLinks.ts";
import { checkScenarioFormat } from "./checkScenarioFormat.ts";
import { HARNESS_PATHS } from "./HARNESS_PATHS.ts";
import type { HarnessProblem } from "./HarnessProblem.ts";
import { loadHarnessFiles } from "./loadHarnessFiles.ts";

export function checkHarness(): number {
  const { files, problems: loadProblems } = loadHarnessFiles();
  const coverage = buildCoverage(files);
  writeFileSync(HARNESS_PATHS.coverage, coverage.markdown);
  const problems: ReadonlyArray<HarnessProblem> = [
    ...loadProblems,
    ...checkScenarioFormat(files),
    ...checkCoveredRulesExist(files),
    ...checkNames(files),
    ...checkCodesAndActions(files),
    ...checkFieldsDocumented(files),
    ...checkRulebookLinks(files),
    ...coverage.gaps.map((rule) => ({
      file: HARNESS_PATHS.coverage,
      where: rule,
      message: "no scenario covers this rule",
    })),
  ];
  for (const problem of problems) {
    console.log(`${problem.file} | ${problem.where} | ${problem.message}`);
  }
  const scenarioCount = files.scenarioFiles.reduce(
    (total, file) => total + file.scenarios.length,
    0,
  );
  console.log(
    `\nHarness check: ${scenarioCount} scenarios in ${files.scenarioFiles.length} files, ${problems.length} problems.`,
  );
  return problems.length === 0 ? 0 : 1;
}

process.exitCode = checkHarness();
