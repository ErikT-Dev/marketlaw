import type { QuestNeed } from "../catalogue/QuestNeed";
import type { Tier } from "../catalogue/Tier";
import type { Result } from "../Result";
import { duplicateNameProblems } from "./duplicateNameProblems";
import type { QuestLine } from "./QuestLine";
import { questNeedsOf } from "./questNeedsOf";
import { questRewardOf } from "./questRewardOf";
import { readRuleFile } from "./readRuleFile";
import type { RuleFileParts } from "./RuleFileParts";
import type { RuleFileProblem } from "./RuleFileProblem";

type Needs = readonly [QuestNeed, ...QuestNeed[]];

const TIER_OF_WORDS: Readonly<Record<string, Tier>> = { "Tier 1": 1, "Tier 2": 2, "Tier 3": 3 };
const QUEST_NAME = /^[A-Z][A-Za-z0-9'-]*(?: [A-Za-z0-9'-]+)*$/;

function questNeedsOfText(requirement: string, line: number): Result<Needs, RuleFileProblem> {
  const parts = requirement.split(", ").map((part) => questNeedsOf(part, line));
  const failed = parts.flatMap((part) => (part.isOk ? [] : [part.error]));
  if (failed[0] !== undefined) {
    return { isOk: false, error: failed[0] };
  }
  const [first, ...rest] = parts.flatMap((part) => (part.isOk ? part.value : []));
  return first === undefined
    ? { isOk: false, error: { line, word: requirement, message: "needs a requirement" } }
    : { isOk: true, value: [first, ...rest] };
}

function tierOf(tierWords: string, line: number): Result<Tier, RuleFileProblem> {
  const tier = TIER_OF_WORDS[tierWords];
  return tier === undefined
    ? {
        isOk: false,
        error: { line, word: tierWords, message: 'the tier is "Tier 1", "Tier 2" or "Tier 3"' },
      }
    : { isOk: true, value: tier };
}

function nameOf(name: string, line: number): Result<string, RuleFileProblem> {
  return QUEST_NAME.test(name)
    ? { isOk: true, value: name }
    : {
        isOk: false,
        error: {
          line,
          word: name,
          message:
            "a quest name has letters, digits, spaces, apostrophes and hyphens, and starts with a capital letter",
        },
      };
}

function readQuestLine(
  [tierWords, nameWords, requirement, rewardText]: RuleFileParts,
  line: number,
): Result<QuestLine, ReadonlyArray<RuleFileProblem>> {
  const tier = tierOf(tierWords, line);
  const name = nameOf(nameWords, line);
  const needs = questNeedsOfText(requirement, line);
  const reward = questRewardOf(rewardText, line);
  if (!tier.isOk || !name.isOk || !needs.isOk || !reward.isOk) {
    return {
      isOk: false,
      error: [tier, name, needs, reward].flatMap((part) => (part.isOk ? [] : [part.error])),
    };
  }
  return {
    isOk: true,
    value: {
      tier: tier.value,
      name: name.value,
      terms: { needs: needs.value, reward: reward.value },
    },
  };
}

export function readQuestFile(
  text: string,
): Result<ReadonlyArray<QuestLine>, ReadonlyArray<RuleFileProblem>> {
  const quests = readRuleFile(text, readQuestLine);
  if (!quests.isOk) {
    return quests;
  }
  const duplicates = duplicateNameProblems(quests.value, ({ name }) => name);
  return duplicates.length > 0
    ? { isOk: false, error: duplicates }
    : { isOk: true, value: quests.value.map(({ value }) => value) };
}
