import { CARD_NAMES } from "../../shared/catalogue/CARD_NAMES";
import { QUEST_LINES } from "../../shared/ruleFiles/QUEST_LINES";
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
  "influence",
  "build pass",
  "build passes",
];

const NAMES_OF_OTHER_THINGS = [
  ...CARD_NAMES,
  ...QUEST_LINES.map(({ name }) => name),
  ...Sector.options,
  ...Object.values(PROJECT_TITLES),
  "Public quality",
  "Public satisfaction",
  "bonus types",
  "bonus-type",
];

const SOFT_HYPHENS = /\u00AD/g;

const LONGEST_NAMES_FIRST = [...NAMES_OF_OTHER_THINGS].sort(
  (first, second) => second.length - first.length,
);

function escaped(word: string): string {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wholeWord(word: string, flags: string): RegExp {
  return new RegExp(`(?<![\\w-])${escaped(word)}(?![\\w-])`, flags);
}

function isIcon(node: Node): boolean {
  return (
    node instanceof Element &&
    node.getAttribute("role") === "img" &&
    (node.tagName === "IMG" || node.querySelector("img") !== null)
  );
}

function textWithoutIcons(node: Node): string {
  if (isIcon(node)) {
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
    textWithoutIcons(node).replace(SOFT_HYPHENS, ""),
  );
  const stats = STAT_WORDS.filter((word) => wholeWord(word, "i").test(visible));
  const types = TYPE_NAMES.filter((type) => wholeWord(type, "").test(visible));
  return [...stats, ...types];
}
