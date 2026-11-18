import { isDeepStrictEqual } from "node:util";
import { TUTORIAL_SETUP } from "../../src/rules/tutorial/TUTORIAL_SETUP.ts";
import type { QuestLine } from "../../src/shared/ruleFiles/QuestLine.ts";
import { readQuestFile } from "../../src/shared/ruleFiles/readQuestFile.ts";
import { HARNESS_PATHS } from "./HARNESS_PATHS.ts";
import type { HarnessProblem } from "./HarnessProblem.ts";
import { TUTORIAL_TRADING_POST_LINE } from "./TUTORIAL_TRADING_POST_LINE.ts";

const TUTORIAL_QUEST_RULE = "T0.7";

function tradingPostProblems(quests: ReadonlyArray<QuestLine>): ReadonlyArray<HarnessProblem> {
  const expected = readQuestFile(TUTORIAL_TRADING_POST_LINE);
  const [expectedQuest] = expected.isOk ? expected.value : [];
  const quest = quests.find(({ name }) => name === expectedQuest?.name);
  return expectedQuest === undefined ||
    quest === undefined ||
    isDeepStrictEqual(quest, expectedQuest)
    ? []
    : [
        {
          file: HARNESS_PATHS.quests,
          where: quest.name,
          message: `the tutorial (${TUTORIAL_QUEST_RULE}) needs exactly "${TUTORIAL_TRADING_POST_LINE}"`,
        },
      ];
}

export function checkTutorialQuests(
  quests: ReadonlyArray<QuestLine>,
): ReadonlyArray<HarnessProblem> {
  const missing = TUTORIAL_SETUP.quests.filter(
    (name) => !quests.some((quest) => quest.name === name && quest.tier === 1),
  );
  return [
    ...missing.map((name) => ({
      file: HARNESS_PATHS.quests,
      where: name,
      message: `the tutorial (${TUTORIAL_QUEST_RULE}) needs this tier 1 quest`,
    })),
    ...tradingPostProblems(quests),
  ];
}
