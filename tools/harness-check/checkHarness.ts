import { writeFileSync } from "node:fs";
import { buildCoverage } from "./buildCoverage.ts";
import { checkCodesAndActions } from "./checkCodesAndActions.ts";
import { checkCoveredRulesExist } from "./checkCoveredRulesExist.ts";
import { checkEverythingRequired } from "./checkEverythingRequired.ts";
import { checkFieldsDocumented } from "./checkFieldsDocumented.ts";
import { checkNames } from "./checkNames.ts";
import { checkPlayerIconFolder } from "./checkPlayerIconFolder.ts";
import { checkPlayerIconList } from "./checkPlayerIconList.ts";
import { checkRuleFiles } from "./checkRuleFiles.ts";
import { checkRulebookLinks } from "./checkRulebookLinks.ts";
import { checkRulebookTypes } from "./checkRulebookTypes.ts";
import { checkScenarioFormat } from "./checkScenarioFormat.ts";
import { checkUniqueNames } from "./checkUniqueNames.ts";
import { HARNESS_PATHS } from "./HARNESS_PATHS.ts";
import type { HarnessProblem } from "./HarnessProblem.ts";
import { loadHarnessFiles } from "./loadHarnessFiles.ts";
import { readPlayerIconFolder } from "./readPlayerIconFolder.ts";

export function checkHarness(): number {
  const { files, problems: loadProblems } = loadHarnessFiles();
  const playerIcons = readPlayerIconFolder();
  const coverage = buildCoverage(files);
  writeFileSync(HARNESS_PATHS.coverage, coverage.markdown);
  const problems: ReadonlyArray<HarnessProblem> = [
    ...loadProblems,
    ...checkRuleFiles(files),
    ...checkScenarioFormat(files),
    ...checkUniqueNames(files),
    ...checkCoveredRulesExist(files),
    ...checkEverythingRequired(files),
    ...checkNames(files),
    ...checkCodesAndActions(files),
    ...checkFieldsDocumented(files),
    ...checkRulebookLinks(files),
    ...checkRulebookTypes(files),
    ...checkPlayerIconFolder(playerIcons.files, playerIcons.licenceText),
    ...checkPlayerIconList(playerIcons.files),
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
