import type { SimulationSummary } from "./SimulationSummary.ts";

export const NO_GAMES: SimulationSummary = {
  games: 0,
  acceptedActions: 0,
  acceptedByType: {},
  turnsPlayed: 0,
  mostRowsPerAcceptedAction: 0,
  mostRowsPerOtherMessage: 0,
  mostAlarmChangesOverAllowance: 0,
  threePlayerAwakeMs: 0,
  threePlayerTurns: 0,
  legalGameTotals: {},
  largestMeasures: {},
  violationCounts: {},
  shortestViolations: [],
};
