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

function afterSeatTwoDrewInItsMainPhase(): SavedGame {
  const saved = afterFirstGoOfTurnTwo();
  const rich = {
    ...saved,
    state: {
      ...saved.state,
      seats: saved.state.seats.map((seat) =>
        seat.seat === 2 ? { ...seat, stats: { ...seat.stats, influence: 10 } } : seat,
      ),
    },
  };
  return applied(
    rich,
    { type: "draw_action", seat: 2, kind: "Residential", tier: 1 },
    FIRST_GO_ENDS_AT + 1_000,
  );
}

function drawingSeatsShownTo(saved: SavedGame, viewer: 1 | 2 | 3) {
  return viewFor(saved.state, viewer)
    .drawLog.filter((entry) => entry.turn === 2 && entry.kind !== "shuffle")
    .map((entry) => entry.seat);
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

  it("hides a main-phase draw from a player still waiting for their market go", () => {
    const before = afterFirstGoOfTurnTwo();
    const drew = afterSeatTwoDrewInItsMainPhase();
    expect(drew.state.deck.length).toBe(before.state.deck.length - 1);
    expect(viewFor(drew.state, 3).deckCount).toBe(before.state.deck.length);
    expect(drawingSeatsShownTo(drew, 3)).toEqual([2]);
    expect(drawingSeatsShownTo(drew, 2)).toEqual([2, 2]);
  });

  it("shows a later market go's draw at once to a player already in their main phase", () => {
    const drew = afterSeatTwoDrewInItsMainPhase();
    const secondGo = applied(
      drew,
      { type: "turn_draw", seat: 3, choice: { option: "B", sector: "Public" } },
      FIRST_GO_ENDS_AT + 2_000,
    );
    const realDeck = secondGo.state.deck.length;
    expect(drawingSeatsShownTo(secondGo, 2)).toEqual([2, 2, 3]);
    expect(viewFor(secondGo.state, 2).deckCount).toBe(realDeck);
    expect(drawingSeatsShownTo(secondGo, 3)).toEqual([2, 3]);
    expect(viewFor(secondGo.state, 3).deckCount).toBe(realDeck);
    expect(drawingSeatsShownTo(secondGo, 1)).toEqual([2, 3]);
    expect(viewFor(secondGo.state, 1).deckCount).toBe(realDeck + 1);
  });
});
