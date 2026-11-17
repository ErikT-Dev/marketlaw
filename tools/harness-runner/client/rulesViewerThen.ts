import { linkAnchorsIn } from "../../../src/client/screens/rules/linkAnchorsIn.ts";
import type { Rulebook } from "../../../src/client/screens/rules/Rulebook.ts";
import { HARNESS_PATHS } from "../../harness-check/HARNESS_PATHS.ts";

function doLinksWork(rulebook: Rulebook): boolean {
  const anchors = new Set(rulebook.sections.map(({ anchor }) => anchor));
  const linked = [
    ...rulebook.contents.map(({ anchor }) => anchor),
    ...linkAnchorsIn(rulebook.introduction),
    ...rulebook.sections.flatMap(({ blocks }) => linkAnchorsIn(blocks)),
  ];
  return linked.every((anchor) => anchors.has(anchor));
}

export function rulesViewerThen(rulebook: Rulebook) {
  return {
    source: HARNESS_PATHS.rulebook.split("/").at(-1),
    contents: rulebook.contents.length,
    links_work: doLinksWork(rulebook),
  };
}
