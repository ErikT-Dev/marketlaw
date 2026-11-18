import { CARD_SET_HASH } from "../cardSet/CARD_SET_HASH";
import { RULES_HASH } from "../rules/RULES_HASH";
import type { GameMenuEntry } from "./GameMenuEntry";
import type { GameMenuPlace } from "./GameMenuPlace";
import { TUTORIAL_LABEL } from "./TUTORIAL_LABEL";

const LOBBY_ENTRIES: ReadonlyArray<GameMenuEntry> = [
  {
    label: "Rules",
    line: "How to play, with examples",
    choice: { kind: "page", hash: RULES_HASH },
  },
  {
    label: "Card set",
    line: "All 240 cards, with filters and search",
    choice: { kind: "page", hash: CARD_SET_HASH },
  },
];

const GAME_ENTRIES: ReadonlyArray<GameMenuEntry> = [
  {
    label: "Rules",
    line: "Your clock keeps running while you read",
    choice: { kind: "page", hash: RULES_HASH },
  },
  {
    label: "Card set",
    line: "Your clock keeps running while you look",
    choice: { kind: "page", hash: CARD_SET_HASH },
  },
];

const TUTORIAL_ENTRY: GameMenuEntry = {
  label: TUTORIAL_LABEL,
  line: "A guided one-player game that teaches the first turns",
  choice: { kind: "tutorial" },
};

export function gameMenuEntriesOf(place: GameMenuPlace): ReadonlyArray<GameMenuEntry> {
  switch (place) {
    case "lobby":
    case "game_over":
      return [...LOBBY_ENTRIES, TUTORIAL_ENTRY];
    case "waiting_room":
    case "ranked_queue":
    case "tutorial":
      return LOBBY_ENTRIES;
    case "game":
      return GAME_ENTRIES;
  }
}
