import type { HarnessRun } from "./HarnessRun.ts";
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

export function judgeHarness(run: HarnessRun): ReadonlyArray<string> {
  const unchecked = [
    ...run.required.invariants.filter((id) => run.invariantIds.includes(id)),
    ...run.required.budgets.filter((id) => run.budgetIds.includes(id)),
  ].map((id) => `required ${id} has no check yet`);
  return [
    ...unknownNames(run),
    ...run.runs.filter(({ isRequired }) => isRequired).flatMap(requiredScenarioProblem),
    ...unchecked,
    ...run.cardDataProblems.map((problem) => `card-data check: ${problem}`),
  ];
}
