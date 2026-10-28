import type { SimulationSummary } from "./SimulationSummary.ts";

export const NO_GAMES: SimulationSummary = {
  games: 0,
  acceptedActions: 0,
  turnsPlayed: 0,
  mostRowsPerAcceptedAction: 0,
  mostRowsPerOtherMessage: 0,
  violationCounts: {},
  shortestViolations: [],
};
