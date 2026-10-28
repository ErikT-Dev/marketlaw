import type { BotKind } from "./BotKind.ts";
import type { FoundViolation } from "./FoundViolation.ts";
import { mergeSummaries } from "./mergeSummaries.ts";
import { simulateGame } from "./simulateGame.ts";
import type { SimulatedGame } from "./SimulatedGame.ts";
import type { SimulationSummary } from "./SimulationSummary.ts";

const PLAYER_COUNTS = [2, 3, 4] as const;
const BOTS: ReadonlyArray<BotKind> = ["legal", "chaos"];

function summaryOf(game: SimulatedGame): SimulationSummary {
  const violations: ReadonlyArray<FoundViolation> = game.violations.map((message) => ({
    invariant: message.split(":")[0] ?? message,
    message,
    seed: game.seed,
    players: game.players,
    bot: game.bot,
    messages: game.messages,
  }));
  return {
    games: 1,
    acceptedActions: game.acceptedActions,
    turnsPlayed: game.turnsPlayed,
    mostRowsPerAcceptedAction: Math.max(0, ...game.rowsPerAcceptedAction),
    mostRowsPerOtherMessage: Math.max(0, ...game.rowsPerOtherMessage),
    violationCounts: Object.fromEntries(
      [...new Set(violations.map(({ invariant }) => invariant))].map((invariant) => [invariant, 1]),
    ),
    shortestViolations: violations,
  };
}

export function simulateSlice(firstSeed: number, games: number, lastTurn: number) {
  const summaries: SimulationSummary[] = [];
  for (let seed = firstSeed; seed < firstSeed + games; seed += 1) {
    const players = PLAYER_COUNTS[seed % PLAYER_COUNTS.length] ?? 2;
    const bot = BOTS[seed % BOTS.length] ?? "legal";
    summaries.push(summaryOf(simulateGame(seed, players, bot, lastTurn)));
  }
  return mergeSummaries(summaries);
}
