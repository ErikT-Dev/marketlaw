import * as v from "valibot";
import type { QuestNeed } from "../catalogue/QuestNeed";
import { QuestStat } from "../catalogue/QuestStat";
import { Sector } from "../catalogue/Sector";
import { Tier } from "../catalogue/Tier";
import type { Result } from "../Result";
import { questNumberOf } from "./questNumberOf";
import type { RuleFileProblem } from "./RuleFileProblem";
import { typeNameOfWords } from "./typeNameOfWords";

type NeedsResult = Result<ReadonlyArray<QuestNeed>, RuleFileProblem>;

const INCOME = /^income (\S+)$/;
const COUNTED = /^(\S+) (.+)$/;
const SECTOR_CARDS = /^(?:tier (\d+) )?(.+) cards?$/;
const EACH_SECTOR = /^cards? of each sector$/;
const SECTORS_WITH_TIER_3 = /^sectors? with a tier 3 card$/;
const COMPLETED_PROJECTS = /^completed projects?$/;

function needs(...list: ReadonlyArray<QuestNeed>): NeedsResult {
  return { isOk: true, value: list };
}

function sectorCardsNeed(words: string, count: number, line: number): NeedsResult {
  const match = SECTOR_CARDS.exec(words);
  const sectorWords = match?.[2] ?? "";
  if (match === null || !v.is(Sector, sectorWords)) {
    const word = match === null ? words : sectorWords;
    return { isOk: false, error: { line, word, message: "unknown sector" } };
  }
  const tierWord = match[1];
  if (tierWord === undefined) {
    return needs({ kind: "cards", sector: sectorWords, tier: "any", count });
  }
  const tier = Number(tierWord);
  if (!v.is(Tier, tier)) {
    return { isOk: false, error: { line, word: tierWord, message: "needs tier 1, 2 or 3" } };
  }
  return needs({ kind: "cards", sector: sectorWords, tier, count });
}

function countedNeeds(words: string, count: number, line: number): NeedsResult {
  if (EACH_SECTOR.test(words)) {
    return needs(
      ...Sector.options.map((sector) => ({
        kind: "cards" as const,
        sector,
        tier: "any" as const,
        count,
      })),
    );
  }
  if (SECTORS_WITH_TIER_3.test(words)) {
    return needs({ kind: "sectors_with_tier", tier: 3, count });
  }
  if (COMPLETED_PROJECTS.test(words)) {
    return needs({ kind: "projects", count });
  }
  if (v.is(QuestStat, words)) {
    return needs({ kind: "stat", stat: words, count });
  }
  if (SECTOR_CARDS.test(words)) {
    return sectorCardsNeed(words, count, line);
  }
  const type = typeNameOfWords(words, line);
  return type.isOk ? needs({ kind: "type", type: type.value, count }) : type;
}

export function questNeedsOf(part: string, line: number): NeedsResult {
  const income = INCOME.exec(part);
  const counted = income === null ? COUNTED.exec(part) : null;
  const countWord = income?.[1] ?? counted?.[1] ?? part;
  const count = questNumberOf(countWord);
  if (count === null) {
    return {
      isOk: false,
      error: { line, word: countWord, message: "needs a whole number from 1 to 999" },
    };
  }
  return income === null
    ? countedNeeds(counted?.[2] ?? "", count, line)
    : needs({ kind: "income", count });
}
