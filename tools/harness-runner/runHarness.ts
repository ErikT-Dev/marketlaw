import { readFileSync, writeFileSync } from "node:fs";
import { parse } from "yaml";
import { checkScenarioFormat } from "../harness-check/checkScenarioFormat.ts";
import { HARNESS_PATHS } from "../harness-check/HARNESS_PATHS.ts";
import { loadHarnessFiles } from "../harness-check/loadHarnessFiles.ts";
import { readCoverageExceptions } from "../harness-check/readCoverageExceptions.ts";
import { buildReport } from "./buildReport.ts";
import { buildSteadyScenarioRuns } from "./buildSteadyScenarioRuns.ts";
import { checkCardData } from "./checkCardData.ts";
import { simulateBusyDay } from "../simulator/busyDay/simulateBusyDay.ts";
import { simulateInParallel } from "../simulator/simulateInParallel.ts";
import { checkRatings } from "./checkRatings.ts";
import { checkReplayExport } from "./checkReplayExport.ts";
import { checkTierShares } from "./checkTierShares.ts";
import { LAST_SIMULATED_TURN } from "./LAST_SIMULATED_TURN.ts";
import { SIMULATED_INVARIANTS } from "./SIMULATED_INVARIANTS.ts";
import type { HarnessOutcome } from "./HarnessOutcome.ts";
import type { HarnessRun } from "./HarnessRun.ts";
import { judgeHarness } from "./judgeHarness.ts";
import { livePasswordHashCpuMs } from "./livePasswordHashCpuMs.ts";
import { readBudgetEntries } from "./readBudgetEntries.ts";
import { readIdentifiedEntries } from "./readIdentifiedEntries.ts";
import { readRequiredList } from "./readRequiredList.ts";
import type { RequiredList } from "./RequiredList.ts";
import type { ScenarioDriver } from "./ScenarioDriver.ts";

const DRAWS_PER_TURN = 100_000;
const NOTHING_REQUIRED: RequiredList = { scenarios: [], invariants: [], budgets: [] };

export async function runHarness(
  drivers: ReadonlyArray<ScenarioDriver>,
  simulatedGames: number,
): Promise<HarnessOutcome> {
  const { files, problems: loadProblems } = loadHarnessFiles();
  const readingProblems = [...loadProblems, ...checkScenarioFormat(files)].map(
    ({ file, where, message }) => `${file} | ${where} | ${message}`,
  );
  const requiredResult = readRequiredList(parse(readFileSync(HARNESS_PATHS.required, "utf8")));
  const required = requiredResult.isOk ? requiredResult.value : NOTHING_REQUIRED;
  const invariants = readIdentifiedEntries(files.invariants);
  const budgets = readBudgetEntries(files.budgets);
  const run: HarnessRun = {
    required,
    runs: await buildSteadyScenarioRuns(files.scenarioFiles, required, drivers),
    invariantIds: invariants.map(({ id }) => id),
    budgetIds: budgets.map(({ id }) => id),
    cardDataProblems: checkCardData(files.cards),
    tierShareProblems: checkTierShares(DRAWS_PER_TURN),
    replayExportProblems: checkReplayExport(),
    ratingProblems: checkRatings(),
    simulation: await simulateInParallel(simulatedGames, LAST_SIMULATED_TURN),
    busyDay: simulateBusyDay(),
    passwordHashCpuMs: livePasswordHashCpuMs(),
    simulatedInvariants: SIMULATED_INVARIANTS,
  };
  const problems = [
    ...readingProblems,
    ...(requiredResult.isOk ? [] : requiredResult.error),
    ...judgeHarness(run),
  ];
  const report = buildReport({
    run,
    problems,
    ruleSpecs: files.ruleSpecs,
    exceptions: readCoverageExceptions(files.coverageExceptions),
    invariants,
    budgets,
    generatedAt: new Date().toISOString(),
  });
  writeFileSync(HARNESS_PATHS.report, report);
  return { run, problems };
}
