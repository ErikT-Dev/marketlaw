import { describe, expect, it } from "vitest";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import { applyDueTimeOuts } from "./applyDueTimeOuts";
import { applyToSavedGame } from "./applyToSavedGame";
import { earliestDeadline } from "./earliestDeadline";
import { randomForNextAction } from "./randomForNextAction";
import type { SavedGame } from "./SavedGame";
import { startSavedGame } from "./startSavedGame";

const PAUSED_AT = 300_000;
const DAY_MS = 86_400_000;

function pausedGame(): SavedGame {
  const started = startSavedGame({ players: 3, kind: "casual", startedAt: GAME_STARTED_AT }, 7);
  const paused = applyToSavedGame(
    started,
    { type: "pause_game", seat: 1 },
    PAUSED_AT,
    randomForNextAction(started),
  );
  if (!paused.isOk) {
    throw new Error("the game did not pause");
  }
  return paused.value;
}

describe("a paused game", () => {
  it("sets its next deadline 24 hours after the pause", () => {
    expect(earliestDeadline(pausedGame().state)).toBe(PAUSED_AT + DAY_MS);
  });

  it("goes on being paused just before 24 hours", () => {
    const later = applyDueTimeOuts(pausedGame(), PAUSED_AT + DAY_MS - 1, randomForNextAction);
    expect(later.state.phase).toBe("main");
  });

  it("is abandoned with no winner after 24 hours", () => {
    const later = applyDueTimeOuts(pausedGame(), PAUSED_AT + DAY_MS, randomForNextAction);
    expect(later.state.phase).toBe("ended");
    expect(later.state.result?.endedBy).toBe("paused_too_long");
    expect(later.state.pause).toBeNull();
    expect(earliestDeadline(later.state)).toBeNull();
  });

  it("rejects abandoning before 24 hours", () => {
    const game = pausedGame();
    const early = applyToSavedGame(
      game,
      { type: "abandon_game", seat: 1 },
      PAUSED_AT + DAY_MS - 1,
      randomForNextAction(game),
    );
    expect(early.isOk ? undefined : early.error.code).toBe("not_this_step");
  });
});
