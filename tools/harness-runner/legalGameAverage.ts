import type { SimulationSummary } from "../simulator/SimulationSummary.ts";

export function legalGameAverage(
  simulation: SimulationSummary,
  measure: string,
  players: 3 | 4,
): number {
  const games = simulation.legalGameTotals[`games:${String(players)}`] ?? 0;
  const total = simulation.legalGameTotals[`${measure}:${String(players)}`] ?? 0;
  return games === 0 ? 0 : Math.ceil(total / games);
}
