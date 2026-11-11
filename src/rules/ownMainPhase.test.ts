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
const FIRST_GO_ENDS_AT = TURN_TWO_AT + 10_000;

function applied(saved: SavedGame, action: GameAction, at: number): SavedGame {
  const result = applyToSavedGame(saved, action, at, randomForNextAction(saved));
  if (!result.isOk) {
    throw new Error(`${action.type} was rejected: ${result.error.code}`);
  }
  return result.value;
}

function afterFirstGoOfTurnTwo(): SavedGame {
  const started = startSavedGame({ players: 3, kind: "casual", startedAt: GAME_STARTED_AT }, 11);
  const turnTwo = ([1, 2, 3] as const).reduce(
    (saved, seat) => applied(saved, { type: "end_turn", seat }, TURN_TWO_AT),
    started,
  );
  return applied(
    turnTwo,
    { type: "turn_draw", seat: 2, choice: { option: "B", sector: "Service" } },
    FIRST_GO_ENDS_AT,
  );
}

function clockOf(saved: SavedGame, seat: 1 | 2 | 3) {
  return viewFor(saved.state, seat).seats.find((shown) => shown.seat === seat)?.clock ?? null;
}

describe("each player's own main phase", () => {
  it("shows the market phase as the main phase to a player whose go is over", () => {
    const saved = afterFirstGoOfTurnTwo();
    expect(saved.state.phase).toBe("market");
    expect(viewFor(saved.state, 2).phase).toBe("main");
    expect(viewFor(saved.state, 1).phase).toBe("market");
  });

  it("counts a player's free time from the end of their own market go", () => {
    const saved = afterFirstGoOfTurnTwo();
    const later = applied(
      saved,
      { type: "turn_draw", seat: 3, choice: { option: "B", sector: "Public" } },
      FIRST_GO_ENDS_AT + 20_000,
    );
    expect(clockOf(later, 2)?.freeUntil).toBe(FIRST_GO_ENDS_AT + TIME_RULES.mainFreeMs);
    expect(clockOf(later, 3)?.freeUntil).toBe(FIRST_GO_ENDS_AT + 20_000 + TIME_RULES.mainFreeMs);
  });

  it("moves a main-phase player's clock by the length of a pause during the market phase", () => {
    const saved = afterFirstGoOfTurnTwo();
    const paused = applied(saved, { type: "pause_game", seat: 3 }, FIRST_GO_ENDS_AT + 40_000);
    const resumed = applied(paused, { type: "resume_game", seat: 3 }, FIRST_GO_ENDS_AT + 100_000);
    expect(clockOf(resumed, 2)?.freeUntil).toBe(
      FIRST_GO_ENDS_AT + 60_000 + TIME_RULES.mainFreeMs,
    );
  });

  it("ends the main phase when the last player leaves on their go and everyone else is done", () => {
    const saved = afterFirstGoOfTurnTwo();
    const secondGo = applied(
      saved,
      { type: "turn_draw", seat: 3, choice: { option: "B", sector: "Public" } },
      FIRST_GO_ENDS_AT + 1_000,
    );
    const done = ([2, 3] as const).reduce(
      (soFar, seat) => applied(soFar, { type: "end_turn", seat }, FIRST_GO_ENDS_AT + 2_000),
      secondGo,
    );
    const left = applied(done, { type: "leave_game", seat: 1 }, FIRST_GO_ENDS_AT + 3_000);
    expect(left.state.turn).toBe(3);
  });
});
