import type { CardName } from "../shared/catalogue/CardName";
import type { PlayerView } from "../shared/PlayerView";
import type { ActionIntent } from "../shared/protocol/ActionIntent";
import type { BotChooser } from "./BotChooser";
import { ownSeatOf } from "./ownSeatOf";

const PLAY_CHANCE_IN_TEN = 6;
const SELL_CHANCE_IN_TEN = 3;
const HAND_KEPT_WHEN_SELLING = 3;

function oneOf<T>(items: ReadonlyArray<T>, chooser: BotChooser): T | undefined {
  return items[chooser.pickIndex(items.length)];
}

function cardsToSell(hand: ReadonlyArray<CardName>, chooser: BotChooser): ActionIntent | null {
  const first = oneOf(hand, chooser);
  if (first === undefined) {
    return null;
  }
  const second = oneOf(
    hand.filter((card) => card !== first),
    chooser,
  );
  return second === undefined || chooser.pickIndex(2) === 0
    ? { type: "sell", cards: [first] }
    : { type: "sell", cards: [first, second] };
}

export function legalBot(view: PlayerView, chooser: BotChooser): ActionIntent | null {
  const seat = ownSeatOf(view);
  if (seat.endTurnRejection !== null) {
    return null;
  }
  const playable = seat.handDetails.filter((details) => details.playRejection === null);
  const toPlay = oneOf(playable, chooser);
  if (toPlay !== undefined && chooser.pickIndex(10) < PLAY_CHANCE_IN_TEN) {
    return { type: "play_card", card: toPlay.card };
  }
  const canSell = seat.sellRejection === null && seat.hand.length > HAND_KEPT_WHEN_SELLING;
  const sale =
    canSell && chooser.pickIndex(10) < SELL_CHANCE_IN_TEN ? cardsToSell(seat.hand, chooser) : null;
  return sale ?? { type: "end_turn" };
}
