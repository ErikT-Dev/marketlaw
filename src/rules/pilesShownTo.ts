import type { CardName } from "../shared/catalogue/CardName";
import type { DrawLogEntry } from "../shared/DrawLogEntry";
import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import { isAskedCard } from "./isAskedCard";

type PilesShown = {
  readonly deckCount: number;
  readonly discard: ReadonlyArray<CardName>;
  readonly drawLog: ReadonlyArray<DrawLogEntry>;
};

type ShownSoFar = { readonly deckCount: number; readonly discard: ReadonlyArray<CardName> };

function afterOwnEntry(shown: ShownSoFar, entry: DrawLogEntry): ShownSoFar {
  if (entry.kind !== "shuffle") {
    return { ...shown, deckCount: shown.deckCount - entry.count };
  }
  const asked = entry.asked;
  const moved =
    asked === null ? shown.discard : shown.discard.filter((card) => isAskedCard(card, asked));
  return {
    deckCount: shown.deckCount + moved.length,
    discard: shown.discard.filter((card) => !moved.includes(card)),
  };
}

export function pilesShownTo(state: GameState, viewer: SeatNumber): PilesShown {
  if (state.phase !== "main") {
    return { deckCount: state.deck.length, discard: state.discard, drawLog: state.drawLog };
  }
  const start = state.mainPhaseStart;
  const earlier = state.drawLog.slice(0, start.drawLogLength);
  const own = state.drawLog.slice(start.drawLogLength).filter((entry) => entry.seat === viewer);
  const shown = own.reduce(afterOwnEntry, { deckCount: start.deckCount, discard: start.discard });
  const drawn = state.seats.find((seat) => seat.seat === viewer)?.drawnThisPhase ?? [];
  const drawnFromShownDiscard = drawn.filter((card) => shown.discard.includes(card));
  return {
    deckCount: shown.deckCount + drawnFromShownDiscard.length,
    discard: shown.discard.filter((card) => !drawnFromShownDiscard.includes(card)),
    drawLog: [...earlier, ...own],
  };
}
