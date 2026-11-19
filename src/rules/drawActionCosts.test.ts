import { describe, expect, it } from "vitest";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import { applyToSavedGame } from "./applyToSavedGame";
import { randomForNextAction } from "./randomForNextAction";
import type { SavedGame } from "./SavedGame";
import { startSavedGame } from "./startSavedGame";
import { viewFor } from "./viewFor";

function withSeatOneBelowZeroInQualityAndSatisfaction(): SavedGame {
  const saved = startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 5);
  return {
    ...saved,
    state: {
      ...saved.state,
      seats: saved.state.seats.map((seat) =>
        seat.seat === 1
          ? { ...seat, stats: { ...seat.stats, influence: 3, quality: -2, satisfaction: -1 } }
          : seat,
      ),
    },
  };
}

describe("draw action costs", () => {
  it("offers a draw action to a player below zero in a stat the draw does not cost", () => {
    const saved = withSeatOneBelowZeroInQualityAndSatisfaction();
    const own = viewFor(saved.state, 1).seats.find((seat) => seat.kind === "own");
    const drawActions = own?.kind === "own" ? own.drawActions : [];
    const status = drawActions.find(({ kind, tier }) => kind === "Residential" && tier === 1);
    expect(status?.rejection).toBeNull();
  });

  it("accepts a draw action from a player below zero in a stat the draw does not cost", () => {
    const saved = withSeatOneBelowZeroInQualityAndSatisfaction();
    const result = applyToSavedGame(
      saved,
      { type: "draw_action", seat: 1, kind: "Residential", tier: 1 },
      GAME_STARTED_AT + 1_000,
      randomForNextAction(saved),
    );
    const seatOne = result.isOk
      ? result.value.state.seats.find(({ seat }) => seat === 1)
      : undefined;
    expect(seatOne?.stats.influence).toBe(0);
  });
});
