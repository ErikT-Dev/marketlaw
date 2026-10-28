import { isAskedCard } from "../../src/rules/isAskedCard.ts";
import type { GameState } from "../../src/rules/GameState.ts";
import type { CardName } from "../../src/shared/catalogue/CardName.ts";
import type { PlayerView } from "../../src/shared/PlayerView.ts";
import type { SeatNumber } from "../../src/shared/SeatNumber.ts";

function shuffledAwayBy(state: GameState, viewer: SeatNumber): ReadonlyArray<CardName> {
  const ownShuffles = state.drawLog
    .slice(state.mainPhaseStart.drawLogLength)
    .flatMap((entry) => (entry.kind === "shuffle" && entry.seat === viewer ? [entry] : []));
  return state.mainPhaseStart.discard.filter((card) =>
    ownShuffles.some((shuffle) => shuffle.asked === null || isAskedCard(card, shuffle.asked)),
  );
}

export function shownPilesViolations(
  state: GameState,
  viewer: SeatNumber,
  view: PlayerView,
): ReadonlyArray<string> {
  const label = `I24: seat ${String(viewer)}`;
  const own = state.seats.find((seat) => seat.seat === viewer);
  const shuffledAway = shuffledAwayBy(state, viewer);
  const drawn = own?.drawnThisPhase ?? [];
  const expectedDiscard = state.mainPhaseStart.discard.filter(
    (card) => !shuffledAway.includes(card) && !drawn.includes(card),
  );
  const shuffledIn = state.drawLog
    .slice(state.mainPhaseStart.drawLogLength)
    .reduce(
      (sum, entry) => sum + (entry.kind === "shuffle" && entry.seat === viewer ? entry.count : 0),
      0,
    );
  const drawnFromDeck = drawn.filter(
    (card) => !state.mainPhaseStart.discard.includes(card) || shuffledAway.includes(card),
  ).length;
  const expectedDeckCount = state.mainPhaseStart.deck.length + shuffledIn - drawnFromDeck;
  const ownCards = [...(own?.hand ?? []), ...(own?.city ?? [])];
  return [
    ...(JSON.stringify(view.discard) === JSON.stringify(expectedDiscard)
      ? []
      : [`${label} is shown a discard pile that R5.5 does not give`]),
    ...(view.deckCount === expectedDeckCount
      ? []
      : [
          `${label} is shown ${String(view.deckCount)} deck cards, not ${String(expectedDeckCount)}`,
        ]),
    ...(view.deckCount < 0 ? [`${label} is shown a negative deck count`] : []),
    ...(view.discard.some((card) => ownCards.includes(card))
      ? [`${label} is shown one of its own cards in the discard pile`]
      : []),
  ];
}
