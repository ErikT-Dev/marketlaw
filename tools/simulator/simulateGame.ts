import type { BotKind } from "./BotKind.ts";
import { GameSimulation } from "./GameSimulation.ts";
import { replayViolations } from "./replayViolations.ts";
import { seededChooser } from "./seededChooser.ts";
import type { SimulatedGame } from "./SimulatedGame.ts";

const MESSAGES_PER_GAME = 3_000;

export function simulateGame(
  seed: number,
  players: 2 | 3 | 4,
  bot: BotKind,
  lastTurn: number,
): SimulatedGame {
  const chooser = seededChooser(seed);
  const simulation = new GameSimulation(seed, players, bot, chooser);
  simulation.connectEveryone();
  while (simulation.messages.length < MESSAGES_PER_GAME) {
    const state = simulation.record.game?.saved.state;
    if (state === undefined || state.turn > lastTurn || state.phase !== "main") {
      break;
    }
    const candidates =
      bot === "chaos"
        ? simulation.seats
        : simulation.seats.filter((seat) =>
            seat.view?.seats.some((view) => view.kind === "own" && view.endTurnRejection === null),
          );
    const acting = candidates[chooser.pickIndex(candidates.length)];
    if (acting === undefined) {
      break;
    }
    simulation.takeTurnFor(acting);
  }
  const saved = simulation.record.game?.saved;
  return {
    seed,
    players,
    bot,
    messages: simulation.messages,
    violations: [
      ...simulation.violations,
      ...(saved === undefined ? [] : replayViolations(saved, simulation.statesAfterEachAction)),
    ],
    rowsPerAcceptedAction: simulation.rowsPerAcceptedAction,
    rowsPerOtherMessage: simulation.rowsPerOtherMessage,
    turnsPlayed: (saved?.state.turn ?? 1) - 1,
    acceptedActions: saved?.actionLog.length ?? 0,
  };
}
