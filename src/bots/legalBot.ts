import type { CardName } from "../shared/catalogue/CardName";
import { cardOf } from "../shared/catalogue/cardOf";
import { kindOf } from "../shared/catalogue/kindOf";
import type { PlayerView } from "../shared/PlayerView";
import type { ActionIntent } from "../shared/protocol/ActionIntent";
import type { BotChooser } from "./BotChooser";
import { ownSeatOf } from "./ownSeatOf";
import { kindWanted } from "./kindWanted";

const OTHER_CARD_CHANCE_IN_TEN = 2;
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
  const wanted = playable.filter(
    (details) => kindOf(cardOf(details.card)) === kindWanted(seat.stats),
  );
  const isOtherCardPlayed = chooser.pickIndex(10) < OTHER_CARD_CHANCE_IN_TEN;
  const toPlay = oneOf(wanted.length > 0 || !isOtherCardPlayed ? wanted : playable, chooser);
  if (toPlay !== undefined) {
    return { type: "play_card", card: toPlay.card };
  }
  const canSell = seat.sellRejection === null && seat.hand.length > HAND_KEPT_WHEN_SELLING;
  const sale =
    canSell && chooser.pickIndex(10) < SELL_CHANCE_IN_TEN ? cardsToSell(seat.hand, chooser) : null;
  return sale ?? { type: "end_turn" };
}
