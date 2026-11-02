import type { FoundViolation } from "./FoundViolation.ts";

export type SimulationSummary = {
  readonly games: number;
  readonly acceptedActions: number;
  readonly acceptedByType: Readonly<Record<string, number>>;
  readonly turnsPlayed: number;
  readonly mostRowsPerAcceptedAction: number;
  readonly mostRowsPerOtherMessage: number;
  readonly mostAlarmChangesOverAllowance: number;
  readonly threePlayerAwakeMs: number;
  readonly threePlayerTurns: number;
  readonly legalGameTotals: Readonly<Record<string, number>>;
  readonly largestMeasures: Readonly<Record<string, number>>;
  readonly violationCounts: Readonly<Record<string, number>>;
  readonly shortestViolations: ReadonlyArray<FoundViolation>;
};
