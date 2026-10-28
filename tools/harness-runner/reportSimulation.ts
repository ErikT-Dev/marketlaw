import type { SimulationSummary } from "../simulator/SimulationSummary.ts";
import { escapeHtml } from "./escapeHtml.ts";
import { LAST_SIMULATED_TURN } from "./LAST_SIMULATED_TURN.ts";
import { statusBadge } from "./statusBadge.ts";

function shortestFailures(simulation: SimulationSummary): string {
  return simulation.shortestViolations
    .map((found) => {
      const messages = found.messages.map((message) => escapeHtml(message)).join("\n");
      return `<li>${statusBadge("fails")}${escapeHtml(`${found.message} (seed ${String(found.seed)}, ${String(found.players)} players, ${found.bot} bot, ${String(found.messages.length)} messages)`)}<pre>${messages}</pre></li>`;
    })
    .join("");
}

function acceptedByTypeText(simulation: SimulationSummary): string {
  return Object.entries(simulation.acceptedByType)
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([type, count]) => `${type} ${String(count)}`)
    .join(", ");
}

export function reportSimulation(
  simulation: SimulationSummary,
  checkedInvariants: ReadonlyArray<string>,
): string {
  const status = Object.keys(simulation.violationCounts).length === 0 ? "passes" : "fails";
  const facts = [
    `${String(simulation.games)} seeded games with 2, 3 and 4 seats, half with the legal bot and half with the chaos bot, until turn ${String(LAST_SIMULATED_TURN)}`,
    `${String(simulation.acceptedActions)} accepted actions over ${String(simulation.turnsPlayed)} turns: ${acceptedByTypeText(simulation)}`,
    `invariants checked after every message: ${checkedInvariants.join(", ")}; every game replayed from its seed and action log (I26)`,
    `rows written: at most ${String(simulation.mostRowsPerAcceptedAction)} per accepted action (B1), ${String(simulation.mostRowsPerOtherMessage)} for any other message (B2)`,
  ];
  const list = facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join("");
  return `<h2>Simulation</h2><p>${statusBadge(status)}</p><ul>${list}${shortestFailures(simulation)}</ul>`;
}
