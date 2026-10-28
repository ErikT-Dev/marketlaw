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
  return entry.kind === "draw" ? -entry.count : entry.count;
}

export function pilesShownTo(state: GameState, viewer: SeatNumber): PilesShown {
  if (state.phase !== "main") {
    return { deckCount: state.deck.length, discard: state.discard, drawLog: state.drawLog };
  }
  const start = state.mainPhaseStart;
  const earlier = state.drawLog.slice(0, start.drawLogLength);
  const own = state.drawLog.slice(start.drawLogLength).filter((entry) => entry.seat === viewer);
  return {
    deckCount: own.reduce((count, entry) => count + deckChange(entry), start.deckCount),
    discard: own.reduce(afterShuffle, start.discard),
    drawLog: [...earlier, ...own],
  };
}
