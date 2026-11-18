import rulebookText from "../../../../harness/spec/rulebook.md?raw";
import { INFLUENCE_ACTIONS } from "../../../shared/ruleFiles/INFLUENCE_ACTIONS";
import { QUEST_LINES } from "../../../shared/ruleFiles/QUEST_LINES";
import { parseRulebook } from "./parseRulebook";
import type { Rulebook } from "./Rulebook";
import { rulebookWithRuleFileTables } from "./rulebookWithRuleFileTables";

function parsedRulebook(): Rulebook {
  const result = parseRulebook(
    rulebookWithRuleFileTables(rulebookText, {
      influenceActions: INFLUENCE_ACTIONS,
      quests: QUEST_LINES,
    }),
  );
  if (!result.isOk) {
    throw new Error(`The rulebook could not be read: ${result.error.join("; ")}`);
  }
  return result.value;
}

export const PARSED_RULEBOOK: Rulebook = parsedRulebook();
