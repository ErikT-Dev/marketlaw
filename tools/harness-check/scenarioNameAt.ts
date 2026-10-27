import { isRecord } from "./isRecord.ts";

export function scenarioNameAt(scenarios: ReadonlyArray<unknown>, instancePath: string): string {
  const index = Number(instancePath.split("/")[1]);
  const scenario = Number.isInteger(index) ? scenarios[index] : undefined;
  if (isRecord(scenario) && typeof scenario["name"] === "string") {
    return scenario["name"];
  }
  return Number.isInteger(index) ? `scenario ${index + 1}` : "whole file";
}
