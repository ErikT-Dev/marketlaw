import { deflateRawSync } from "node:zlib";
import type { GameAction } from "../../src/rules/GameAction.ts";
import type { SavedGame } from "../../src/rules/SavedGame.ts";
import type { RoomRecord } from "../../src/server/room/RoomRecord.ts";
import type { BotChooser } from "../../src/bots/BotChooser.ts";
import type { BotKind } from "./BotKind.ts";
import { GameSimulation } from "./GameSimulation.ts";
import { replayViolations } from "./replayViolations.ts";
import { TURN_LIMIT } from "../../src/shared/TURN_LIMIT.ts";
import { CHAOS_LAST_TURN } from "./CHAOS_LAST_TURN.ts";
import { averageFundsOf } from "./averageFundsOf.ts";
import { gameLengthMeasuresOf } from "./gameLengthMeasuresOf.ts";
import { seededChooser } from "./seededChooser.ts";
import type { SimulatedSeat } from "./SimulatedSeat.ts";
import type { SimulatedGame } from "./SimulatedGame.ts";

const MESSAGES_PER_GAME = 20_000;

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

function noteFundsAtTurnStart(
  simulation: GameSimulation,
  fundsAtTurnStart: Record<number, number>,
) {
  const state = simulation.record.game?.saved.state;
  if (state !== undefined && fundsAtTurnStart[state.turn] === undefined) {
    fundsAtTurnStart[state.turn] = averageFundsOf(state);
  }
}

function measuresOf(
  simulation: GameSimulation,
  saved: SavedGame | undefined,
  fundsAtTurnStart: Readonly<Record<number, number>>,
): Readonly<Record<string, number>> {
  const replay =
    saved === undefined
      ? ""
      : JSON.stringify({ seed: saved.seed, setup: saved.setup, actionLog: saved.actionLog });
  return {
    rowsWritten: simulation.rowsWritten + simulation.alarm.changes,
    rowsRead: simulation.rowsRead,
    messages: simulation.messages.length,
    savedBytes: deflateRawSync(JSON.stringify(simulation.record)).length,
    replayBytes: replay.length,
    ...(saved === undefined ? {} : gameLengthMeasuresOf(saved, fundsAtTurnStart)),
  };
}

function endViolations(
  simulation: GameSimulation,
  saved: SavedGame | undefined,
  isPlayedToTheEnd: boolean,
): ReadonlyArray<string> {
  if (saved === undefined) {
    return ["I21: the game never started"];
  }
  const replayed = replayViolations(saved, simulation.statesAfterEachAction);
  return saved.state.phase === "ended" || !isPlayedToTheEnd
    ? replayed
    : [
        ...replayed,
        `I21: the game did not end (turn ${String(saved.state.turn)}, ${String(simulation.messages.length)} messages)`,
      ];
}

export function simulateGame(
  seed: number,
  players: 2 | 3 | 4,
  bot: BotKind,
  lastTurn: number,
  stored: (record: RoomRecord) => RoomRecord = (record) => record,
): SimulatedGame {
  const chooser = seededChooser(seed);
  const turnsToPlay = bot === "chaos" ? Math.min(lastTurn, CHAOS_LAST_TURN) : lastTurn;
  const simulation = new GameSimulation(seed, players, { bot, chooser, stored });
  simulation.connectEveryone();
  const fundsAtTurnStart: Record<number, number> = {};
  noteFundsAtTurnStart(simulation, fundsAtTurnStart);
  for (
    let acting = nextActingSeat(simulation, chooser, turnsToPlay);
    acting !== undefined && simulation.messages.length < MESSAGES_PER_GAME;
    acting = nextActingSeat(simulation, chooser, turnsToPlay)
  ) {
    simulation.takeTurnFor(acting);
    noteFundsAtTurnStart(simulation, fundsAtTurnStart);
  }
  simulation.alarm.finish();
  const saved = simulation.record.game?.saved;
  return {
    seed,
    players,
    bot,
    messages: simulation.messages,
    firstViolationAt: simulation.firstViolationAt,
    violations: [
      ...simulation.violations,
      ...endViolations(simulation, saved, turnsToPlay >= TURN_LIMIT),
    ],
    rowsPerAcceptedAction: simulation.rowsPerAcceptedAction,
    rowsPerOtherMessage: simulation.rowsPerOtherMessage,
    mostAlarmChangesOverAllowance: simulation.alarm.mostChangesOverAllowance,
    awakeMs: simulation.awake.awakeMs,
    measures: measuresOf(simulation, saved, fundsAtTurnStart),
    turnsPlayed: (saved?.state.turn ?? 1) - 1,
    acceptedActions: saved?.actionLog.length ?? 0,
    acceptedByType: countsByType((saved?.actionLog ?? []).map(({ action }) => action)),
  };
}
