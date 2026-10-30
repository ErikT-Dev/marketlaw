import type { GameAction } from "../../src/rules/GameAction.ts";
import type { RoomRecord } from "../../src/server/room/RoomRecord.ts";
import type { BotChooser } from "../../src/bots/BotChooser.ts";
import type { BotKind } from "./BotKind.ts";
import { GameSimulation } from "./GameSimulation.ts";
import { replayViolations } from "./replayViolations.ts";
import { seededChooser } from "./seededChooser.ts";
import type { SimulatedSeat } from "./SimulatedSeat.ts";
import type { SimulatedGame } from "./SimulatedGame.ts";

const MESSAGES_PER_GAME = 3_000;

function countsByType(actions: ReadonlyArray<GameAction>): Readonly<Record<string, number>> {
  return actions.reduce<Readonly<Record<string, number>>>(
    (counts, { type }) => ({ ...counts, [type]: (counts[type] ?? 0) + 1 }),
    {},
  );
}

function nextActingSeat(
  simulation: GameSimulation,
  chooser: BotChooser,
  lastTurn: number,
): SimulatedSeat | undefined {
  const state = simulation.record.game?.saved.state;
  if (state === undefined || state.turn > lastTurn || state.phase === "ended") {
    return undefined;
  }
  const candidates =
    simulation.bot === "chaos"
      ? simulation.seats
      : simulation.seats.filter((seat) =>
          seat.view?.seats.some(
            (view) =>
              view.kind === "own" &&
              (view.endTurnRejection === null || view.turnDrawRejection === null),
          ),
        );
  return candidates[chooser.pickIndex(candidates.length)];
}

export function simulateGame(
  seed: number,
  players: 2 | 3 | 4,
  bot: BotKind,
  lastTurn: number,
  stored: (record: RoomRecord) => RoomRecord = (record) => record,
): SimulatedGame {
  const chooser = seededChooser(seed);
  const simulation = new GameSimulation(seed, players, { bot, chooser, stored });
  simulation.connectEveryone();
  for (
    let acting = nextActingSeat(simulation, chooser, lastTurn);
    acting !== undefined && simulation.messages.length < MESSAGES_PER_GAME;
    acting = nextActingSeat(simulation, chooser, lastTurn)
  ) {
    simulation.takeTurnFor(acting);
  }
  const saved = simulation.record.game?.saved;
  return {
    seed,
    players,
    bot,
    messages: simulation.messages,
    firstViolationAt: simulation.firstViolationAt,
    violations: [
      ...simulation.violations,
      ...(saved === undefined ? [] : replayViolations(saved, simulation.statesAfterEachAction)),
    ],
    rowsPerAcceptedAction: simulation.rowsPerAcceptedAction,
    rowsPerOtherMessage: simulation.rowsPerOtherMessage,
    turnsPlayed: (saved?.state.turn ?? 1) - 1,
    acceptedActions: saved?.actionLog.length ?? 0,
    acceptedByType: countsByType((saved?.actionLog ?? []).map(({ action }) => action)),
  };
}
