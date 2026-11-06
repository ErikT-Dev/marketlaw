import { CARD_NAMES } from "../../shared/catalogue/CARD_NAMES";
import { QUEST_NAMES_BY_TIER } from "../../shared/catalogue/QUEST_NAMES_BY_TIER";
import { Sector } from "../../shared/catalogue/Sector";
import { TYPE_NAMES } from "../../shared/catalogue/TYPE_NAMES";
import { PROJECT_TITLES } from "../screens/game/PROJECT_TITLES";

const STAT_WORDS = [
  "funds",
  "fund",
  "income",
  "workforce",
  "quality",
  "satisfaction",
  "product",
  "distribution",
  "bonus",
  "influence",
  "build pass",
  "build passes",
];

const NAMES_OF_OTHER_THINGS = [
  ...CARD_NAMES,
  ...QUEST_NAMES_BY_TIER.flatMap(({ names }) => names),
  ...Sector.options,
  ...Object.values(PROJECT_TITLES),
  "Public quality",
  "Public satisfaction",
  "bonus types",
  "bonus-type",
  "first-completion bonus",
];

const LONGEST_NAMES_FIRST = [...NAMES_OF_OTHER_THINGS].sort(
  (first, second) => second.length - first.length,
);

function escaped(word: string): string {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wholeWord(word: string, flags: string): RegExp {
  return new RegExp(`(?<![\\w-])${escaped(word)}(?![\\w-])`, flags);
}

function textWithoutIcons(node: Node): string {
  if (node instanceof Element && node.getAttribute("role") === "img") {
    return " ";
  }
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }
  return ` ${Array.from(node.childNodes, textWithoutIcons).join(" ")} `;
}

export function statAndTypeWordsShownIn(node: Node): ReadonlyArray<string> {
  const visible = LONGEST_NAMES_FIRST.reduce(
    (text, name) => text.replace(wholeWord(name, "gi"), " "),
    textWithoutIcons(node),
  );
  const stats = STAT_WORDS.filter((word) => wholeWord(word, "i").test(visible));
  const types = TYPE_NAMES.filter((type) => wholeWord(type, "").test(visible));
  return [...stats, ...types];
}
