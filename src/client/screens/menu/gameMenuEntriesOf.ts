import { CARD_SET_HASH } from "../cardSet/CARD_SET_HASH";
import { RULES_HASH } from "../rules/RULES_HASH";
import type { GameMenuEntry } from "./GameMenuEntry";
import type { GameMenuPlace } from "./GameMenuPlace";

const LOBBY_ENTRIES: ReadonlyArray<GameMenuEntry> = [
  { label: "Rules", line: "How to play, with examples", hash: RULES_HASH },
  { label: "Card set", line: "All 240 cards, with filters and search", hash: CARD_SET_HASH },
];

const GAME_ENTRIES: ReadonlyArray<GameMenuEntry> = [
  { label: "Rules", line: "Your clock keeps running while you read", hash: RULES_HASH },
  { label: "Card set", line: "Your clock keeps running while you look", hash: CARD_SET_HASH },
];

export function gameMenuEntriesOf(place: GameMenuPlace): ReadonlyArray<GameMenuEntry> {
  return place === "game" ? GAME_ENTRIES : LOBBY_ENTRIES;
}
