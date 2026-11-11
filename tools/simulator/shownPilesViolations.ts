import { isAskedCard } from "../../src/rules/isAskedCard.ts";
import type { GameState } from "../../src/rules/GameState.ts";
import type { SeatPilesAtStart } from "../../src/rules/SeatPilesAtStart.ts";
import type { CardName } from "../../src/shared/catalogue/CardName.ts";
import type { DrawLogEntry } from "../../src/shared/DrawLogEntry.ts";
import type { PlayerView } from "../../src/shared/PlayerView.ts";
import type { SeatNumber } from "../../src/shared/SeatNumber.ts";

type MarketGoEntries = {
  readonly entries: ReadonlyArray<DrawLogEntry>;
  readonly drawn: ReadonlyArray<CardName>;
};

function marketGosAfter(state: GameState, start: SeatPilesAtStart): ReadonlyArray<MarketGoEntries> {
  return state.mainPhaseStart.marketGos
    .filter((go) => go.fromLogLength >= start.drawLogLength)
    .map((go) => ({
      entries: state.drawLog.slice(go.fromLogLength, go.toLogLength),
      drawn: go.drawn,
    }));
}

function shuffledAwayBy(
  state: GameState,
  viewer: SeatNumber,
  start: SeatPilesAtStart,
): ReadonlyArray<CardName> {
  const ownShuffles = state.drawLog
    .slice(start.drawLogLength)
    .filter((entry) => entry.kind === "shuffle" && entry.seat === viewer);
  const shuffles = [
    ...ownShuffles,
    ...marketGosAfter(state, start).flatMap((go) => go.entries),
  ].flatMap((entry) => (entry.kind === "shuffle" ? [entry] : []));
  return start.discard.filter((card) =>
    shuffles.some((shuffle) => shuffle.asked === null || isAskedCard(card, shuffle.asked)),
  );
}

function startShownTo(state: GameState, viewer: SeatNumber): SeatPilesAtStart | undefined {
  const piles = state.mainPhaseStart.piles;
  return piles.find((start) => start.seat === viewer) ?? piles[0];
}

export function shownPilesViolations(
  state: GameState,
  viewer: SeatNumber,
  view: PlayerView,
): ReadonlyArray<string> {
  const start = startShownTo(state, viewer);
  if (start === undefined) {
    return [];
  }
  const label = `I24: seat ${String(viewer)}`;
  const own = state.seats.find((seat) => seat.seat === viewer);
  const shuffledAway = shuffledAwayBy(state, viewer, start);
  const drawn = [
    ...(own?.drawnThisPhase ?? []),
    ...marketGosAfter(state, start).flatMap((go) => go.drawn),
  ];
  const expectedDiscard = start.discard.filter(
    (card) => !shuffledAway.includes(card) && !drawn.includes(card),
  );
  const drawnFromDeck = drawn.filter(
    (card) => !start.discard.includes(card) || shuffledAway.includes(card),
  ).length;
  const expectedDeckCount = start.deckCount + shuffledAway.length - drawnFromDeck;
  return [
    ...(view.discardCount === expectedDiscard.length
      ? []
      : [
          `${label} is shown ${String(view.discardCount)} discard cards, not ${String(expectedDiscard.length)}`,
        ]),
    ...(view.deckCount === expectedDeckCount
      ? []
      : [
          `${label} is shown ${String(view.deckCount)} deck cards, not ${String(expectedDeckCount)}`,
        ]),
    ...(view.deckCount < 0 ? [`${label} is shown a negative deck count`] : []),
  ];
}
