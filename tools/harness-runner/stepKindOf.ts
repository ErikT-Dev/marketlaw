import type { ScenarioStep } from "./ScenarioStep.ts";

const NON_ACTION_STEPS = ["wait_ms", "disconnect", "reconnect", "raw"];

export function stepKindOf(step: ScenarioStep): string {
  if (typeof step === "string") {
    return step;
  }
  if (typeof step["action"] === "string") {
    return step["action"];
  }
  return NON_ACTION_STEPS.find((key) => key in step) ?? "unknown step";
}
