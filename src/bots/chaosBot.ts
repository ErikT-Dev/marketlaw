import { CARD_NAMES } from "../shared/catalogue/CARD_NAMES";
import type { CardName } from "../shared/catalogue/CardName";
import { Kind } from "../shared/catalogue/Kind";
import { QuestName } from "../shared/catalogue/QuestName";
import { Tier } from "../shared/catalogue/Tier";
import type { PlayerView } from "../shared/PlayerView";
import type { ActionIntent } from "../shared/protocol/ActionIntent";
import { TradeName } from "../shared/TradeName";
import type { BotChooser } from "./BotChooser";
import type { ChaosMove } from "./ChaosMove";
import { legalBot } from "./legalBot";
import { oneOf } from "./oneOf";
import { ownSeatOf } from "./ownSeatOf";

const MALFORMED_TEXTS = [
  "{",
  "null",
  '{"type":"action","action":{"type":"fly"}}',
  '{"type":"action","protocolVersion":1,"token":"x","actionId":"","stateVersion":-1}',
];

function cardOutside(excluded: ReadonlyArray<CardName>, chooser: BotChooser) {
  const outside = CARD_NAMES.filter((card) => !excluded.includes(card));
  return outside[chooser.pickIndex(outside.length)] ?? "Pub";
}

function cardNotHeld(view: PlayerView, chooser: BotChooser) {
  return cardOutside(ownSeatOf(view).hand, chooser);
}

function cardNotInMarketplace(view: PlayerView, chooser: BotChooser) {
  const shown = view.marketplace.flatMap(({ card }) => (card === null ? [] : [card]));
  return cardOutside([...ownSeatOf(view).hand, ...shown], chooser);
}

function projectOrQuestIntent(chooser: BotChooser): ActionIntent {
  return chooser.pickIndex(2) === 0
    ? { type: "complete_project", project: "quality" }
    : { type: "complete_quest", quest: oneOf(QuestName.options, chooser) ?? "Farmland" };
}

function illegalIntent(view: PlayerView, chooser: BotChooser): ActionIntent {
  const unplayable = ownSeatOf(view).handDetails.filter(
    (details) => details.playRejection !== null,
  );
  const blocked = unplayable[chooser.pickIndex(unplayable.length)];
  switch (chooser.pickIndex(9)) {
    case 8:
      return {
        type: "turn_draw",
        choice: { option: "A", card: cardNotInMarketplace(view, chooser) },
      };
    case 5:
      return { type: "influence", trade: oneOf(TradeName.options, chooser) ?? "skip_build" };
    case 6:
      return {
        type: "draw_action",
        kind: oneOf(Kind.options, chooser) ?? "Industry",
        tier: oneOf(Tier.options, chooser) ?? 1,
      };
    case 7:
      return { type: "undo" };
    case 3:
      return { type: "claim_all" };
    case 4:
      return projectOrQuestIntent(chooser);
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

const LEAVE_ONE_IN = 400;

export function chaosBot(view: PlayerView, chooser: BotChooser): ChaosMove {
  if (chooser.pickIndex(LEAVE_ONE_IN) === 0) {
    return { kind: "intent", intent: { type: "leave_game" } };
  }
  const roll = chooser.pickIndex(20);
  if (roll < 2) {
    return { kind: "raw", text: MALFORMED_TEXTS[chooser.pickIndex(MALFORMED_TEXTS.length)] ?? "{" };
  }
  if (roll < 4) {
    return { kind: "stale", intent: legalBot(view, chooser) ?? { type: "end_turn" } };
  }
  if (roll < 5) {
    return { kind: "repeat" };
  }
  const legal = roll < 14 ? legalBot(view, chooser) : null;
  return { kind: "intent", intent: legal ?? illegalIntent(view, chooser) };
}
