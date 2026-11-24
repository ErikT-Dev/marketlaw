import type { LastTurn } from "../shared/LastTurn";
import type { MainPhaseLogEntry } from "../shared/MainPhaseLogEntry";
import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";

type Completion<Name> = { readonly name: Name; readonly seat: SeatNumber };

function groupedBySeats<Name>(
  completions: ReadonlyArray<Completion<Name>>,
): ReadonlyArray<{ readonly name: Name; readonly seats: ReadonlyArray<SeatNumber> }> {
  const names = completions
    .map(({ name }) => name)
    .filter((name, index, all) => all.indexOf(name) === index);
  return names.map((name) => ({
    name,
    seats: completions.filter((completion) => completion.name === name).map(({ seat }) => seat),
  }));
}

function entriesOfTurn(
  log: ReadonlyArray<MainPhaseLogEntry>,
  turn: number,
): ReadonlyArray<MainPhaseLogEntry> {
  return log.filter((entry) => entry.turn === turn);
}

export function lastTurnOf(state: GameState): LastTurn {
  const before = entriesOfTurn(state.mainPhaseLog, state.turn - 1);
  const atStart = entriesOfTurn(state.mainPhaseLog, state.turn);
  return {
    quests: groupedBySeats(
      before.flatMap((entry) =>
        entry.kind === "completed_quest" ? [{ name: entry.quest, seat: entry.seat }] : [],
      ),
    ).map(({ name, seats }) => ({ quest: name, seats })),
    projects: groupedBySeats(
      before.flatMap((entry) =>
        entry.kind === "completed_project" ? [{ name: entry.project, seat: entry.seat }] : [],
      ),
    ).map(({ name, seats }) => ({ project: name, seats })),
    incomeGains: atStart.flatMap((entry) =>
      entry.kind === "income_gained" ? [{ seat: entry.seat, income: entry.income }] : [],
    ),
    support: atStart.flatMap((entry) =>
      entry.kind === "support" ? [{ seat: entry.seat, funds: entry.funds }] : [],
    ),
  };
}
