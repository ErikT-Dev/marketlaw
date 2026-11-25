import { BUDGET_CHECKS } from "./BUDGET_CHECKS.ts";
import type { HarnessRun } from "./HarnessRun.ts";
import { highestMeasured } from "./highestMeasured.ts";
import { MEASURED_BUDGET_LIMITS } from "./MEASURED_BUDGET_LIMITS.ts";
import { simulationProblems } from "./simulationProblems.ts";
import type { ScenarioRun } from "./ScenarioRun.ts";

function unknownNames(run: HarnessRun): ReadonlyArray<string> {
  const scenarios = run.required.scenarios
    .filter(
      ({ file, name }) =>
        !run.runs.some(({ scenario }) => scenario.file === file && scenario.name === name),
    )
    .map(({ file, name }) => `required scenario "${file}: ${name}" does not exist`);
  const invariants = run.required.invariants
    .filter((id) => !run.invariantIds.includes(id))
    .map((id) => `required invariant ${id} does not exist`);
  const budgets = run.required.budgets
    .filter((id) => !run.budgetIds.includes(id))
    .map((id) => `required budget ${id} does not exist`);
  return [...scenarios, ...invariants, ...budgets];
}

function requiredScenarioProblem({ scenario, result }: ScenarioRun): ReadonlyArray<string> {
  const label = `required scenario "${scenario.file}: ${scenario.name}"`;
  switch (result.status) {
    case "passes":
      return [];
    case "fails":
      return [`${label} fails: ${result.problems.join("; ")}`];
    case "not_yet":
      return [`${label} cannot run yet: ${result.missing.join(", ")}`];
    default: {
      const unexpected: never = result;
      return [`${label} has an unknown result ${String(unexpected)}`];
    }
  }
}

function budgetProblem(run: HarnessRun, budget: string): ReadonlyArray<string> {
  if (BUDGET_CHECKS[budget]?.by === "other check") {
    return [];
  }
  const limit = MEASURED_BUDGET_LIMITS[budget];
  const measured = highestMeasured(run, budget);
  if (limit === undefined || measured === undefined) {
    return [`required ${budget} has no check yet`];
  }
  return measured > limit
    ? [`required ${budget} measured ${measured}, over its limit of ${limit}`]
    : [];
}

export function judgeHarness(run: HarnessRun): ReadonlyArray<string> {
  const unchecked = [
    ...run.required.invariants
      .filter((id) => run.invariantIds.includes(id) && !run.simulatedInvariants.includes(id))
      .map((id) => `required ${id} has no check yet`),
    ...simulationProblems(
      run.simulation,
      run.required.invariants.filter((id) => run.simulatedInvariants.includes(id)),
    ),
    ...run.required.budgets
      .filter((id) => run.budgetIds.includes(id))
      .flatMap((id) => budgetProblem(run, id)),
  ];
  return [
    ...unknownNames(run),
    ...run.runs.filter(({ isRequired }) => isRequired).flatMap(requiredScenarioProblem),
    ...unchecked,
    ...run.cardDataProblems.map((problem) => `card-data check: ${problem}`),
    ...run.tierShareProblems.map((problem) => `statistical tier check: ${problem}`),
    ...run.replayExportProblems.map((problem) => `replay export check: ${problem}`),
    ...run.ratingProblems.map((problem) => `rating calculation check: ${problem}`),
  ];
}
