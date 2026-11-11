import { describe, expect, it } from "vitest";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import { applyToSavedGame } from "./applyToSavedGame";
import type { GameAction } from "./GameAction";
import { randomForNextAction } from "./randomForNextAction";
import type { SavedGame } from "./SavedGame";
import { startSavedGame } from "./startSavedGame";
import { TIME_RULES } from "./TIME_RULES";
import { viewFor } from "./viewFor";

const TURN_TWO_AT = 60_000;
const FIRST_GO_TIMED_OUT_AT = TURN_TWO_AT + TIME_RULES.goLimitMs;

function applied(saved: SavedGame, action: GameAction, at: number): SavedGame {
  const result = applyToSavedGame(saved, action, at, randomForNextAction(saved));
  if (!result.isOk) {
    throw new Error(`${action.type} was rejected: ${result.error.code}`);
  }
  return result.value;
}

function afterFirstGoOfTurnTwoTimedOut(): SavedGame {
  const started = startSavedGame({ players: 3, kind: "casual", startedAt: GAME_STARTED_AT }, 11);
  const turnTwo = ([1, 2, 3] as const).reduce(
    (saved, seat) => applied(saved, { type: "end_turn", seat }, TURN_TWO_AT),
    started,
  );
  return applied(turnTwo, { type: "time_out", seat: 2 }, FIRST_GO_TIMED_OUT_AT);
}

function ownSeatOf(saved: SavedGame, seat: 1 | 2 | 3) {
  const shown = viewFor(saved.state, seat).seats.find((candidate) => candidate.seat === seat);
  if (shown?.kind !== "own") {
    throw new Error(`seat ${String(seat)} is not shown as its own seat`);
  }
  return shown;
}

function turnDrawCountOf(saved: SavedGame, seat: 1 | 2 | 3): number {
  return saved.state.drawLog
    .filter((entry) => entry.kind === "turn_draw" && entry.turn === 2 && entry.seat === seat)
    .reduce((sum, entry) => sum + (entry.kind === "turn_draw" ? entry.count : 0), 0);
}

describe("a turn draw left open", () => {
  it("offers only a deck draw to a player whose market go timed out", () => {
    const saved = afterFirstGoOfTurnTwoTimedOut();
    const seat = ownSeatOf(saved, 2);
    expect(turnDrawCountOf(saved, 2)).toBe(0);
    expect(seat.turnDrawRejection).toBeNull();
    expect(seat.marketCardRejection).toBe("out_of_market");
    expect(viewFor(saved.state, 2).marketGo).toBe(3);
  });

  it("blocks undoing earlier actions once the open turn draw is taken", () => {
    const saved = afterFirstGoOfTurnTwoTimedOut();
    const withUndoPoint = {
      ...saved,
      state: {
        ...saved.state,
        seats: saved.state.seats.map((seat) =>
          seat.seat === 2 ? { ...seat, undoPoints: [seat] } : seat,
        ),
      },
    };
    expect(ownSeatOf(withUndoPoint, 2).undoRejection).toBeNull();
    const drew = applied(
      withUndoPoint,
      { type: "turn_draw", seat: 2, choice: { option: "B", sector: "Service" } },
      FIRST_GO_TIMED_OUT_AT + 1_000,
    );
    expect(ownSeatOf(drew, 2).undoRejection).toBe("cannot_undo");
    expect(turnDrawCountOf(drew, 2)).toBe(2);
  });

  it("is drawn for a player out of time when they are made done", () => {
    const saved = afterFirstGoOfTurnTwoTimedOut();
    const goesTaken = ([3, 1] as const).reduce(
      (soFar, seat) =>
        applied(
          soFar,
          { type: "turn_draw", seat, choice: { option: "B", sector: "Public" } },
          FIRST_GO_TIMED_OUT_AT + 1_000,
        ),
      saved,
    );
    const othersDone = ([3, 1] as const).reduce(
      (soFar, seat) => applied(soFar, { type: "end_turn", seat }, FIRST_GO_TIMED_OUT_AT + 2_000),
      goesTaken,
    );
    const deadline = ownSeatOf(othersDone, 2).clock?.deadline ?? 0;
    const madeDone = applied(othersDone, { type: "time_out", seat: 2 }, deadline);
    expect(madeDone.state.turn).toBe(3);
    expect(turnDrawCountOf(madeDone, 2)).toBe(2);
  });
});
