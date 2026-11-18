import type { InfluenceAction } from "../../../shared/ruleFiles/InfluenceAction";
import type { QuestLine } from "../../../shared/ruleFiles/QuestLine";
import { influenceActionsTableText } from "./influenceActionsTableText";
import { questTablesText } from "./questTablesText";

type RuleFiles = {
  readonly influenceActions: ReadonlyArray<InfluenceAction>;
  readonly quests: ReadonlyArray<QuestLine>;
};

export function rulebookWithRuleFileTables(rulebookText: string, ruleFiles: RuleFiles): string {
  return rulebookText
    .split(/\r?\n/)
    .map((line) => {
      switch (line.trim()) {
        case "{influence-actions.txt}":
          return influenceActionsTableText(ruleFiles.influenceActions);
        case "{quests.txt}":
          return questTablesText(ruleFiles.quests);
        default:
          return line;
      }
    })
    .join("\n");
}
