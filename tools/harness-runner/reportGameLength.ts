import type { SimulationSummary } from "../simulator/SimulationSummary.ts";
import { FUNDS_SAMPLE_TURNS } from "../simulator/FUNDS_SAMPLE_TURNS.ts";
import { escapeHtml } from "./escapeHtml.ts";

const GAME_SIZES = [2, 3, 4] as const;

const TRUST_NOTE =
  "How far to trust these numbers: the legal bot picks a random legal move each time. It does not aim for the end goal, plan combos or save for projects, so real players should end games sooner and score higher than the bot. Read the turns as an upper bound and the scores as a lower bound. Rows written grow with accepted actions; the bot also undoes and trades at random, so real games may write fewer rows.";

function perGame(simulation: SimulationSummary, measure: string, games: number): number {
  return games === 0 ? 0 : (simulation.legalGameTotals[measure] ?? 0) / games;
}

function oneDecimal(value: number): string {
  return value.toFixed(1);
}

function fundsCell(simulation: SimulationSummary, players: number, turn: number): string {
  const reached = simulation.legalGameTotals[`reached@${String(turn)}:${String(players)}`] ?? 0;
  const funds = perGame(simulation, `funds@${String(turn)}:${String(players)}`, reached);
  return reached === 0 ? "–" : `${oneDecimal(funds)} (${String(reached)})`;
}

function sizeRow(simulation: SimulationSummary, players: number): ReadonlyArray<string> {
  const games = simulation.legalGameTotals[`games:${String(players)}`] ?? 0;
  return [
    `${String(players)} players`,
    String(games),
    oneDecimal(perGame(simulation, `turns:${String(players)}`, games)),
    `${oneDecimal(perGame(simulation, `endedByEndGoal:${String(players)}`, games) * 100)}%`,
    `${oneDecimal(perGame(simulation, `endedByTurnLimit:${String(players)}`, games) * 100)}%`,
    oneDecimal(perGame(simulation, `winnerScore:${String(players)}`, games)),
    oneDecimal(perGame(simulation, `averageScore:${String(players)}`, games)),
    ...FUNDS_SAMPLE_TURNS.map((turn) => fundsCell(simulation, players, turn)),
    String(Math.ceil(perGame(simulation, `rowsWritten:${String(players)}`, games))),
  ];
}

export function reportGameLength(simulation: SimulationSummary): string {
  const headings = [
    "Game size",
    "Games",
    "Turns per game",
    "Ended by end goal",
    "Ended by turn 40",
    "Winner's score",
    "Average score",
    ...FUNDS_SAMPLE_TURNS.map(
      (turn) => `Average funds at the start of turn ${String(turn)} (games)`,
    ),
    "Rows written per game",
  ];
  const head = `<tr>${headings.map((heading) => `<th>${escapeHtml(heading)}</th>`).join("")}</tr>`;
  const rows = GAME_SIZES.map(
    (players) =>
      `<tr>${sizeRow(simulation, players)
        .map((cell) => `<td>${escapeHtml(cell)}</td>`)
        .join("")}</tr>`,
  ).join("");
  return [
    "<h2>Game length (O5)</h2>",
    "<p>Legal-bot games played to the end, averaged by game size.</p>",
    `<table>${head}${rows}</table>`,
    `<p>${escapeHtml(TRUST_NOTE)}</p>`,
  ].join("\n");
}
