import type { CardName } from "../shared/catalogue/CardName";
import type { DrawLogEntry } from "../shared/DrawLogEntry";
import type { SeatNumber } from "../shared/SeatNumber";
import { cardsDrawnSinceStart } from "./cardsDrawnSinceStart";
import type { GameState } from "./GameState";
import { isAskedCard } from "./isAskedCard";
import { pilesStartShownTo } from "./pilesStartShownTo";

type PilesShown = {
  readonly deckCount: number;
  readonly discard: ReadonlyArray<CardName>;
  readonly drawLog: ReadonlyArray<DrawLogEntry>;
};

type ShownSoFar = { readonly deckCount: number; readonly discard: ReadonlyArray<CardName> };

function afterShownEntry(shown: ShownSoFar, entry: DrawLogEntry): ShownSoFar {
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

function shownEntriesFrom(
  state: GameState,
  viewer: SeatNumber,
  logLength: number,
): ReadonlyArray<DrawLogEntry> {
  const marketGos = state.mainPhaseStart.marketGos;
  return state.drawLog.flatMap((entry, index) => {
    const isOnMarketGo = marketGos.some(
      (go) => index >= go.fromLogLength && index < go.toLogLength,
    );
    return index >= logLength && (entry.seat === viewer || isOnMarketGo) ? [entry] : [];
  });
}

export function pilesShownTo(state: GameState, viewer: SeatNumber): PilesShown {
  const start = pilesStartShownTo(state, viewer);
  const firstStart = state.mainPhaseStart.piles[0];
  if (start === null || firstStart === undefined) {
    return { deckCount: state.deck.length, discard: state.discard, drawLog: state.drawLog };
  }
  const shown = shownEntriesFrom(state, viewer, start.drawLogLength).reduce(afterShownEntry, {
    deckCount: start.deckCount,
    discard: start.discard,
  });
  const drawn = cardsDrawnSinceStart(state, viewer, start);
  const drawnFromShownDiscard = drawn.filter((card) => shown.discard.includes(card));
  return {
    deckCount: shown.deckCount + drawnFromShownDiscard.length,
    discard: shown.discard.filter((card) => !drawnFromShownDiscard.includes(card)),
    drawLog: [
      ...state.drawLog.slice(0, firstStart.drawLogLength),
      ...shownEntriesFrom(state, viewer, firstStart.drawLogLength),
    ],
  };
}
