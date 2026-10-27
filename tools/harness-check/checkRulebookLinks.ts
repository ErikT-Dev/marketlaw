import type { HarnessFiles } from "./HarnessFiles.ts";
import type { HarnessProblem } from "./HarnessProblem.ts";
import { HARNESS_PATHS } from "./HARNESS_PATHS.ts";

const HEADING = /^#{1,6} (.+)$/gm;
const SECTION_LINK = /\]\(#([^)]+)\)/g;

function headingAnchor(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/ /g, "-");
}

export function checkRulebookLinks(files: HarnessFiles): ReadonlyArray<HarnessProblem> {
  const anchors = new Set(
    [...files.rulebookText.matchAll(HEADING)].map((match) => headingAnchor(match[1] ?? "")),
  );
  return [...files.rulebookText.matchAll(SECTION_LINK)]
    .map((match) => match[1] ?? "")
    .filter((anchor) => !anchors.has(anchor))
    .map((anchor) => ({
      file: HARNESS_PATHS.rulebook,
      where: `link #${anchor}`,
      message: "points to a section that does not exist",
    }));
}
