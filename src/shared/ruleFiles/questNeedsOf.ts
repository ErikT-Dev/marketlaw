import * as v from "valibot";
import type { QuestNeed } from "../catalogue/QuestNeed";
import { Sector } from "../catalogue/Sector";
import type { Tier } from "../catalogue/Tier";
import { ProjectName } from "../ProjectName";
import type { Result } from "../Result";
import type { RuleFileProblem } from "./RuleFileProblem";
import { typeNameOfWords } from "./typeNameOfWords";
import { wholeNumberOf } from "./wholeNumberOf";

type NeedsResult = Result<ReadonlyArray<QuestNeed>, RuleFileProblem>;

const INCOME = /^income (\S+)$/;
const COUNTED = /^(\S+) (.+)$/;
const SECTOR_CARDS = /^(tier 2 or 3 |tier 3 )?(.+) cards?$/;
const EACH_SECTOR = /^cards? of each sector$/;
const SECTORS_WITH_TIER_3 = /^sectors? with a tier 3 card$/;
const COMPLETED_PROJECTS = /^completed projects?$/;
const LOWEST_TIER_OF_WORDS: Readonly<Record<string, Tier>> = { "tier 2 or 3 ": 2, "tier 3 ": 3 };

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
  const lowestTier = LOWEST_TIER_OF_WORDS[match[1] ?? ""] ?? 1;
  return needs({ kind: "cards", sector: sectorWords, lowestTier, count });
}

function countedNeeds(words: string, count: number, line: number): NeedsResult {
  if (EACH_SECTOR.test(words)) {
    return needs(
      ...Sector.options.map((sector) => ({
        kind: "cards" as const,
        sector,
        lowestTier: 1 as const,
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
  if (v.is(ProjectName, words)) {
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
  const count = wholeNumberOf(countWord);
  if (count === null) {
    return {
      isOk: false,
      error: { line, word: countWord, message: "needs a whole number from 1 to 99" },
    };
  }
  return income === null
    ? countedNeeds(counted?.[2] ?? "", count, line)
    : needs({ kind: "income", count });
}
