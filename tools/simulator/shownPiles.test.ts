import { describe, expect, it } from "vitest";
import { apply } from "../../src/rules/apply.ts";
import type { GameState } from "../../src/rules/GameState.ts";
import type { Random } from "../../src/rules/Random.ts";
import { STARTING_STATS } from "../../src/rules/STARTING_STATS.ts";
import { startSavedGame } from "../../src/rules/startSavedGame.ts";
import { viewFor } from "../../src/rules/viewFor.ts";
import { withMainPhaseStart } from "../../src/rules/withMainPhaseStart.ts";
import { shownPilesViolations } from "./shownPilesViolations.ts";

const PUBLIC_TIER_1: Random = {
  pickSector: () => "Public",
  pickTier: () => 1,
  pickQuest: (candidates) => candidates[0] ?? "Farmland",
  pickType: (candidates) => candidates[0] ?? "Farm",
  shuffle: (cards) => [...cards].reverse(),
};

function afterSeatTwoDrew(): GameState {
  const fresh = startSavedGame({ players: 2 }, 17).state;
  const ready = withMainPhaseStart({
    ...fresh,
    deck: ["Landfill", "Pub"],
    discard: [],
    seats: fresh.seats.map((seat) =>
      seat.seat === 2
        ? {
            ...seat,
            hand: ["Liquor Shop"],
            stats: { ...STARTING_STATS, workforce: 1, quality: 1, product: 1 },
          }
        : { ...seat, hand: ["Cottage"] },
    ),
  });
  const played = apply(ready, { type: "play_card", seat: 2, card: "Liquor Shop" }, PUBLIC_TIER_1);
  if (!played.isOk) {
    throw new Error(played.error.code);
  }
  return played.value;
}

describe("shown piles check", () => {
  it("accepts the deck and discard that R5.5 gives", () => {
    const state = afterSeatTwoDrew();
    expect(shownPilesViolations(state, 1, viewFor(state, 1))).toEqual([]);
  });

  it("catches a deck count that shows another player's draw", () => {
    const state = afterSeatTwoDrew();
    const live = { ...viewFor(state, 1), deckCount: state.deck.length };
    expect(shownPilesViolations(state, 1, live)).toEqual([
      "I24: seat 1 is shown 1 deck cards, not 2",
    ]);
  });
});
