import { readInfluenceActionFile } from "../../src/shared/ruleFiles/readInfluenceActionFile.ts";
import { readQuestFile } from "../../src/shared/ruleFiles/readQuestFile.ts";
import type { HarnessFiles } from "./HarnessFiles.ts";
import { isRecord } from "./isRecord.ts";
import type { KnownNames } from "./KnownNames.ts";

const TYPE_FIELDS = ["type1", "type2", "type3", "type4", "type5", "doubleType1", "doubleType2"];

function namesOf(
  result: ReturnType<typeof readQuestFile> | ReturnType<typeof readInfluenceActionFile>,
): ReadonlySet<string> {
  return new Set(result.isOk ? result.value.map(({ name }) => name) : []);
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
  return {
    cards,
    quests: namesOf(readQuestFile(files.questsText)),
    types,
    trades: namesOf(readInfluenceActionFile(files.influenceActionsText)),
  };
}
