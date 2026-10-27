import type { HarnessFiles } from "./HarnessFiles.ts";
import { isRecord } from "./isRecord.ts";
import type { KnownNames } from "./KnownNames.ts";

const TYPE_FIELDS = ["type1", "type2", "type3", "type4", "type5", "doubleType1", "doubleType2"];
const QUEST_ROW = /^\s*\| ([^|]+?) \| [^|]+ \| [^|]+ \|\s*$/;

function collectQuestNames(gameRulesText: string): ReadonlySet<string> {
  const start = gameRulesText.indexOf("## R20.");
  const end = gameRulesText.indexOf("## R21.");
  const questSection = gameRulesText.slice(start, end);
  const names = questSection
    .split("\n")
    .map((line) => QUEST_ROW.exec(line)?.[1]?.trim())
    .filter(
      (name): name is string => name !== undefined && name !== "Name" && !name.startsWith("-"),
    );
  return new Set(names);
}

export function collectKnownNames(files: HarnessFiles): KnownNames {
  const cards = new Set<string>();
  const types = new Set<string>();
  for (const card of files.cards) {
    if (!isRecord(card)) {
      continue;
    }
    if (typeof card["cardName"] === "string") {
      cards.add(card["cardName"]);
    }
    for (const field of TYPE_FIELDS) {
      const type = card[field];
      if (typeof type === "string" && type !== "") {
        types.add(type);
      }
    }
  }
  return { cards, quests: collectQuestNames(files.gameRulesText), types };
}
