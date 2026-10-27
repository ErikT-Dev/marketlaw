import type { ScenarioRun } from "./ScenarioRun.ts";

type ReportStatus = "passes" | "fails" | "not yet" | "passes, not yet required";

export function reportStatusOf({ result, isRequired }: ScenarioRun): ReportStatus {
  const isPassing = result.status === "passes";
  if (isRequired) {
    return isPassing ? "passes" : "fails";
  }
  return isPassing ? "passes, not yet required" : "not yet";
}
