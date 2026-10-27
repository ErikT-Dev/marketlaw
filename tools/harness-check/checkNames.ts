import { collectKnownNames } from "./collectKnownNames.ts";
import { forEachScenario } from "./forEachScenario.ts";
import type { HarnessFiles } from "./HarnessFiles.ts";
import type { HarnessProblem } from "./HarnessProblem.ts";
import { isRecord } from "./isRecord.ts";
import type { KnownNames } from "./KnownNames.ts";

const CARD_KEYS = new Set(["card"]);
const CARD_LIST_KEYS = new Set([
  "hand",
  "city",
  "deck",
  "discard",
  "holding_pile",
  "new_cards",
  "known_in_hand",
  "cards",
  "shuffle",
]);
const QUEST_KEYS = new Set(["quest"]);
const QUEST_LIST_KEYS = new Set(["quest_list", "quest_list_excludes", "quests_completed"]);
const TYPE_KEYS = new Set(["type"]);
const TYPE_LIST_KEYS = new Set(["bonus_types"]);
const TYPE_MAP_KEYS = new Set(["gained_types", "type_counts"]);

type NameCheck = {
  readonly known: KnownNames;
  readonly report: (message: string) => void;
};

function checkOne(kind: keyof KnownNames, name: unknown, check: NameCheck): void {
  if (typeof name === "string" && !check.known[kind].has(name)) {
    check.report(`unknown ${kind.slice(0, -1)} name "${name}"`);
  }
}

function checkField(key: string, value: unknown, check: NameCheck): void {
  const list = Array.isArray(value) ? value : [];
  const names = isRecord(value) ? Object.keys(value) : [];
  checkAll("cards", CARD_KEYS.has(key) ? [value] : [], check);
  checkAll("cards", CARD_LIST_KEYS.has(key) ? list : [], check);
  checkAll("quests", QUEST_KEYS.has(key) ? [value] : [], check);
  checkAll("quests", QUEST_LIST_KEYS.has(key) ? list : [], check);
  checkAll("types", TYPE_KEYS.has(key) ? [value] : [], check);
  checkAll("types", TYPE_LIST_KEYS.has(key) ? list : [], check);
  checkAll("types", TYPE_MAP_KEYS.has(key) ? names : [], check);
}

function checkAll(kind: keyof KnownNames, names: ReadonlyArray<unknown>, check: NameCheck): void {
  for (const name of names) {
    checkOne(kind, name, check);
  }
}

function walk(value: unknown, check: NameCheck): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      walk(item, check);
    }
    return;
  }
  if (!isRecord(value)) {
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    checkField(key, child, check);
    walk(child, check);
  }
}

export function checkNames(files: HarnessFiles): ReadonlyArray<HarnessProblem> {
  const known = collectKnownNames(files);
  const problems: HarnessProblem[] = [];
  forEachScenario(files, ({ file, name, scenario }) => {
    function report(message: string): void {
      problems.push({ file, where: name, message });
    }
    walk(
      { given: scenario["given"], when: scenario["when"], then: scenario["then"] },
      { known, report },
    );
  });
  return problems;
}
