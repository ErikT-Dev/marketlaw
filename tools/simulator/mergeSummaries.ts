import type { FoundViolation } from "./FoundViolation.ts";
import { NO_GAMES } from "./NO_GAMES.ts";
import type { SimulationSummary } from "./SimulationSummary.ts";

function shortestPerInvariant(
  violations: ReadonlyArray<FoundViolation>,
): ReadonlyArray<FoundViolation> {
  const byInvariant = new Map<string, FoundViolation>();
  for (const found of violations) {
    const known = byInvariant.get(found.invariant);
    if (known === undefined || found.messages.length < known.messages.length) {
      byInvariant.set(found.invariant, found);
    }
  }
  return [...byInvariant.values()].sort((a, b) => a.invariant.localeCompare(b.invariant));
}

function addCounts(
  first: Readonly<Record<string, number>>,
  second: Readonly<Record<string, number>>,
): Readonly<Record<string, number>> {
  const keys = new Set([...Object.keys(first), ...Object.keys(second)]);
  return Object.fromEntries([...keys].map((key) => [key, (first[key] ?? 0) + (second[key] ?? 0)]));
}

function largestOf(
  first: Readonly<Record<string, number>>,
  second: Readonly<Record<string, number>>,
): Readonly<Record<string, number>> {
  const keys = new Set([...Object.keys(first), ...Object.keys(second)]);
  return Object.fromEntries(
    [...keys].map((key) => [key, Math.max(first[key] ?? 0, second[key] ?? 0)]),
  );
}

export function mergeSummaries(summaries: ReadonlyArray<SimulationSummary>): SimulationSummary {
  return summaries.reduce(
    (merged, summary) => ({
      games: merged.games + summary.games,
      acceptedActions: merged.acceptedActions + summary.acceptedActions,
      acceptedByType: addCounts(merged.acceptedByType, summary.acceptedByType),
      turnsPlayed: merged.turnsPlayed + summary.turnsPlayed,
      mostRowsPerAcceptedAction: Math.max(
        merged.mostRowsPerAcceptedAction,
        summary.mostRowsPerAcceptedAction,
      ),
      mostRowsPerOtherMessage: Math.max(
        merged.mostRowsPerOtherMessage,
        summary.mostRowsPerOtherMessage,
      ),
      mostAlarmChangesOverAllowance: Math.max(
        merged.mostAlarmChangesOverAllowance,
        summary.mostAlarmChangesOverAllowance,
      ),
      threePlayerAwakeMs: merged.threePlayerAwakeMs + summary.threePlayerAwakeMs,
      threePlayerTurns: merged.threePlayerTurns + summary.threePlayerTurns,
      legalGameTotals: addCounts(merged.legalGameTotals, summary.legalGameTotals),
      largestMeasures: largestOf(merged.largestMeasures, summary.largestMeasures),
      violationCounts: addCounts(merged.violationCounts, summary.violationCounts),
      shortestViolations: shortestPerInvariant([
        ...merged.shortestViolations,
        ...summary.shortestViolations,
      ]),
    }),
    NO_GAMES,
  );
}
