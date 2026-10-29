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

function afterShuffle(discard: ReadonlyArray<CardName>, entry: DrawLogEntry) {
  if (entry.kind !== "shuffle") {
    return discard;
  }
  const asked = entry.asked;
  return asked === null ? [] : discard.filter((card) => !isAskedCard(card, asked));
}

function deckChange(entry: DrawLogEntry): number {
  return entry.kind === "shuffle" ? entry.count : -entry.count;
}

export function pilesShownTo(state: GameState, viewer: SeatNumber): PilesShown {
  if (state.phase !== "main") {
    return { deckCount: state.deck.length, discard: state.discard, drawLog: state.drawLog };
  }
  const start = state.mainPhaseStart;
  const earlier = state.drawLog.slice(0, start.drawLogLength);
  const own = state.drawLog.slice(start.drawLogLength).filter((entry) => entry.seat === viewer);
  const discardAfterShuffles = own.reduce(afterShuffle, start.discard);
  const drawn = state.seats.find((seat) => seat.seat === viewer)?.drawnThisPhase ?? [];
  const drawnFromShownDiscard = drawn.filter((card) => discardAfterShuffles.includes(card));
  return {
    deckCount:
      own.reduce((count, entry) => count + deckChange(entry), start.deckCount) +
      drawnFromShownDiscard.length,
    discard: discardAfterShuffles.filter((card) => !drawnFromShownDiscard.includes(card)),
    drawLog: [...earlier, ...own],
  };
}
