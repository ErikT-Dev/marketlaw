import { describe, expect, it } from "vitest";
import type { CardName } from "../shared/catalogue/CardName";
import { cardOf } from "../shared/catalogue/cardOf";
import { kindOf } from "../shared/catalogue/kindOf";
import type { DrawActionStatus } from "../shared/DrawActionStatus";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import { applyToSavedGame } from "./applyToSavedGame";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import { withMainPhaseStart } from "./withMainPhaseStart";
import { randomForNextAction } from "./randomForNextAction";
import type { SavedGame } from "./SavedGame";
import { startSavedGame } from "./startSavedGame";
import { startTutorial } from "./tutorial/startTutorial";
import { tutorialViewFor } from "./tutorial/tutorialViewFor";
import { viewFor } from "./viewFor";

const SEED = 4;

function applied(saved: SavedGame, action: GameAction): SavedGame {
  const result = applyToSavedGame(saved, action, GAME_STARTED_AT + 1_000, randomForNextAction(saved));
  if (!result.isOk) {
    throw new Error(`${action.type} was rejected: ${result.error.code}`);
  }
  return result.value;
}

function scarceCardOf(saved: SavedGame): CardName {
  const card = saved.state.seats[0]?.hand.at(-1);
  if (card === undefined) {
    throw new Error("seat 1 holds no card");
  }
  return card;
}

function isOfKindTier(card: CardName) {
  const { tier } = cardOf(card);
  const kind = kindOf(cardOf(card));
  return (other: CardName) => cardOf(other).tier === tier && kindOf(cardOf(other)) === kind;
}

function isScarceKindTier(saved: SavedGame) {
  const card = cardOf(scarceCardOf(saved));
  return (status: DrawActionStatus) => status.kind === kindOf(card) && status.tier === card.tier;
}

function withOnlyHandHolding(saved: SavedGame): SavedGame {
  const isScarce = isOfKindTier(scarceCardOf(saved));
  const changed: GameState = {
    ...saved.state,
    deck: saved.state.deck.filter((card) => !isScarce(card)),
  };
  return { ...saved, state: withMainPhaseStart(changed) };
}

function ownSeatOf(saved: SavedGame, seat: 1 | 2) {
  const own = viewFor(saved.state, seat).seats.find((shown) => shown.kind === "own");
  return own?.kind === "own" ? own : undefined;
}

describe("redrawing the starting hand", () => {
  it("shows the redrawer a kind and tier that only their old hand held", () => {
    const started = startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, SEED);
    const scarce = withOnlyHandHolding(started);
    const before = ownSeatOf(scarce, 1)?.drawActions.find(isScarceKindTier(scarce));
    const redrawn = applied(scarce, { type: "redraw_hand", seat: 1 });
    const after = ownSeatOf(redrawn, 1)?.drawActions.find(isScarceKindTier(scarce));
    expect(before?.isAnyLeft).toBe(false);
    expect(after?.isAnyLeft).toBe(redrawn.state.deck.some(isOfKindTier(scarceCardOf(scarce))));
    expect(after?.isAnyLeft).toBe(true);
  });

  it("changes nothing another player sees before the main phase ends", () => {
    const started = startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 3);
    const redrawn = applied(started, { type: "redraw_hand", seat: 1 });
    expect(viewFor(redrawn.state, 2)).toEqual(viewFor(started.state, 2));
  });

  it("counts down the redraws left and keeps the hand size", () => {
    const started = startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 3);
    const redrawn = applied(started, { type: "redraw_hand", seat: 1 });
    expect(ownSeatOf(redrawn, 1)?.redrawsLeft).toBe(2);
    expect(ownSeatOf(redrawn, 1)?.hand).toHaveLength(7);
  });

  it("is never offered in the tutorial", () => {
    const own = tutorialViewFor(startTutorial(GAME_STARTED_AT)).game.seats.find(
      (seat) => seat.kind === "own",
    );
    expect(own?.kind === "own" ? own.redrawRejection : null).toBe("not_this_step");
  });
});
