import type { SimulationSummary } from "../simulator/SimulationSummary.ts";
import { MINIMUM_SIMULATED_GAMES } from "./MINIMUM_SIMULATED_GAMES.ts";

export function simulationProblems(
  simulation: SimulationSummary,
  requiredInvariants: ReadonlyArray<string>,
): ReadonlyArray<string> {
  const tooFew =
    requiredInvariants.length > 0 && simulation.games < MINIMUM_SIMULATED_GAMES
      ? [
          `the simulator played ${String(simulation.games)} games, fewer than ${String(MINIMUM_SIMULATED_GAMES)}`,
        ]
      : [];
  const broken = requiredInvariants.flatMap((id) => {
    const count = simulation.violationCounts[id] ?? 0;
    const shortest = simulation.shortestViolations.find(({ invariant }) => invariant === id);
    if (count === 0 || shortest === undefined) {
      return [];
    }
    return [
      `required ${id} broken in ${String(count)} of ${String(simulation.games)} simulated games; shortest: seed ${String(shortest.seed)}, ${String(shortest.players)} players, ${shortest.bot} bot, ${String(shortest.messages.length)} messages: ${shortest.message}`,
    ];
  });
  return [...tooFew, ...broken];
}
