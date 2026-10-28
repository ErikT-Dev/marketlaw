import type { FoundViolation } from "./FoundViolation.ts";

export type SimulationSummary = {
  readonly games: number;
  readonly acceptedActions: number;
  readonly turnsPlayed: number;
  readonly mostRowsPerAcceptedAction: number;
  readonly mostRowsPerOtherMessage: number;
  readonly violationCounts: Readonly<Record<string, number>>;
  readonly shortestViolations: ReadonlyArray<FoundViolation>;
};
