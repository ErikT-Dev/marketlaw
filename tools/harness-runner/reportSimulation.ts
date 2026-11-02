import type { SimulationSummary } from "../simulator/SimulationSummary.ts";
import { awakeSecondsPerGame } from "./awakeSecondsPerGame.ts";
import { legalGameAverage } from "./legalGameAverage.ts";
import { escapeHtml } from "./escapeHtml.ts";
import { CHAOS_LAST_TURN } from "../simulator/CHAOS_LAST_TURN.ts";
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
    `${String(simulation.games)} seeded games with 2, 3 and 4 seats, half with the legal bot, played to the end (at the latest turn ${String(LAST_SIMULATED_TURN)}), and half with the chaos bot, until turn ${String(CHAOS_LAST_TURN)}`,
    `${String(simulation.acceptedActions)} accepted actions over ${String(simulation.turnsPlayed)} turns: ${acceptedByTypeText(simulation)}`,
    `invariants checked after every message: ${checkedInvariants.join(", ")}; every game replayed from its seed and action log (I26)`,
    `rows written: at most ${String(simulation.mostRowsPerAcceptedAction)} per accepted action (B1), ${String(simulation.mostRowsPerOtherMessage)} for any other message (B2)`,
    `alarm changes: the busiest turn made ${String(simulation.mostAlarmChangesOverAllowance)} more than its allowance of market goes + players + 2 (B3, measured as the amount over, limit 0)`,
    `awake time (sleep model in docs/sleep-model.md): about ${String(awakeSecondsPerGame(simulation))} s for a 40-turn 3-player game, from the simulated turns (B12, limit 600)`,
    `per complete legal-bot game: ${String(legalGameAverage(simulation, "rowsWritten", 3))} rows written with 3 players (B4, limit 1,600) and ${String(legalGameAverage(simulation, "rowsWritten", 4))} with 4 (B5, limit 1,600), ${String(legalGameAverage(simulation, "messages", 3))} incoming messages (B9, limit 1,000), ${String(legalGameAverage(simulation, "rowsRead", 3))} rows read (B16, limit 50,000)`,
    `over legal-bot games: largest saved room, compressed as stored, ${String(Math.ceil((simulation.largestMeasures["savedBytes"] ?? 0) / 1024))} KB (B13, limit 100), largest replay record ${String(Math.ceil((simulation.largestMeasures["replayBytes"] ?? 0) / 1024))} KB (B17, limit 100)`,
  ];
  const list = facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join("");
  return `<h2>Simulation</h2><p>${statusBadge(status)}</p><ul>${list}${shortestFailures(simulation)}</ul>`;
}
