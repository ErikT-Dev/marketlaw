import type { Result } from "../../src/shared/Result.ts";
import { readInfluenceActionFile } from "../../src/shared/ruleFiles/readInfluenceActionFile.ts";
import { incomeToPlaceQuestOf } from "../../src/shared/ruleFiles/incomeToPlaceQuestOf.ts";
import { readQuestFile } from "../../src/shared/ruleFiles/readQuestFile.ts";
import { STARTING_STATS } from "../../src/rules/STARTING_STATS.ts";
import type { RuleFileProblem } from "../../src/shared/ruleFiles/RuleFileProblem.ts";
import { checkTutorialQuests } from "./checkTutorialQuests.ts";
import type { HarnessFiles } from "./HarnessFiles.ts";
import { HARNESS_PATHS } from "./HARNESS_PATHS.ts";
import type { HarnessProblem } from "./HarnessProblem.ts";

const TIER_1_QUESTS_NEEDED = 4;

function fileProblems(
  file: string,
  result: Result<unknown, ReadonlyArray<RuleFileProblem>>,
): ReadonlyArray<HarnessProblem> {
  return result.isOk
    ? []
    : result.error.map(({ line, word, message }) => ({
        file,
        where: `line ${String(line)}`,
        message: `${message}: "${word}"`,
      }));
}

function questListProblems(
  result: ReturnType<typeof readQuestFile>,
): ReadonlyArray<HarnessProblem> {
  if (!result.isOk) {
    return fileProblems(HARNESS_PATHS.quests, result);
  }
  const tier1Count = result.value.filter(
    ({ tier, terms }) => tier === 1 && incomeToPlaceQuestOf(terms) <= STARTING_STATS.income,
  ).length;
  const tooFew =
    tier1Count < TIER_1_QUESTS_NEEDED
      ? [
          {
            file: HARNESS_PATHS.quests,
            where: "whole file",
            message: `${String(tier1Count)} tier 1 quests can be placed at the start (at most income 5 and no completed project); the starting table needs ${String(TIER_1_QUESTS_NEEDED)} (R19.3, R19.11)`,
          },
        ]
      : [];
  return [...tooFew, ...checkTutorialQuests(result.value)];
}

export function checkRuleFiles(
  files: Pick<HarnessFiles, "questsText" | "influenceActionsText">,
): ReadonlyArray<HarnessProblem> {
  return [
    ...questListProblems(readQuestFile(files.questsText)),
    ...fileProblems(
      HARNESS_PATHS.influenceActions,
      readInfluenceActionFile(files.influenceActionsText),
    ),
  ];
}
