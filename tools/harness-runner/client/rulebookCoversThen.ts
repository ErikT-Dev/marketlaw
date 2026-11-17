import { readFileSync } from "node:fs";
import type { Rulebook } from "../../../src/client/screens/rules/Rulebook.ts";
import { HARNESS_PATHS } from "../../harness-check/HARNESS_PATHS.ts";

const GAME_RULES_SECTION = /^## (R\d+)\. /gm;

export function rulebookCoversThen(rulebook: Rulebook): ReadonlyArray<string> {
  const ruleSections = [
    ...readFileSync(HARNESS_PATHS.gameRules, "utf8").matchAll(GAME_RULES_SECTION),
  ].map((match) => match[1] ?? "");
  return rulebook.sections.map((section, index) => {
    const rule = ruleSections[index];
    if (rule === undefined) {
      return `extra section ${section.title}`;
    }
    return rulebook.contents[index]?.anchor === section.anchor
      ? rule
      : `${section.title} not in its place in the contents`;
  });
}
