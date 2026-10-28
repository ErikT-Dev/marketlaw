import { CARD_NAMES } from "../shared/catalogue/CARD_NAMES";
import type { PlayerView } from "../shared/PlayerView";
import type { ActionIntent } from "../shared/protocol/ActionIntent";
import type { BotChooser } from "./BotChooser";
import type { ChaosMove } from "./ChaosMove";
import { legalBot } from "./legalBot";
import { ownSeatOf } from "./ownSeatOf";

const MALFORMED_TEXTS = [
  "{",
  "null",
  '{"type":"action","action":{"type":"fly"}}',
  '{"type":"action","protocolVersion":1,"token":"x","actionId":"","stateVersion":-1}',
];

function cardNotHeld(view: PlayerView, chooser: BotChooser) {
  const hand = ownSeatOf(view).hand;
  const notHeld = CARD_NAMES.filter((card) => !hand.includes(card));
  return notHeld[chooser.pickIndex(notHeld.length)] ?? "Pub";
}

function illegalIntent(view: PlayerView, chooser: BotChooser): ActionIntent {
  const unplayable = ownSeatOf(view).handDetails.filter(
    (details) => details.playRejection !== null,
  );
  const blocked = unplayable[chooser.pickIndex(unplayable.length)];
  switch (chooser.pickIndex(3)) {
    case 0:
      return { type: "play_card", card: cardNotHeld(view, chooser) };
    case 1:
      return { type: "sell", cards: [cardNotHeld(view, chooser)] };
    default:
      return blocked === undefined
        ? { type: "play_card", card: cardNotHeld(view, chooser) }
        : { type: "play_card", card: blocked.card };
  }
}

export function chaosBot(view: PlayerView, chooser: BotChooser): ChaosMove {
  const roll = chooser.pickIndex(20);
  if (roll < 2) {
    return { kind: "raw", text: MALFORMED_TEXTS[chooser.pickIndex(MALFORMED_TEXTS.length)] ?? "{" };
  }
  if (roll < 4) {
    return { kind: "stale", intent: illegalIntent(view, chooser) };
  }
  const legal = roll < 14 ? legalBot(view, chooser) : null;
  return { kind: "intent", intent: legal ?? illegalIntent(view, chooser) };
}
