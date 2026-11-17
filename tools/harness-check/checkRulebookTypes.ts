import { collectKnownNames } from "./collectKnownNames.ts";
import type { HarnessFiles } from "./HarnessFiles.ts";
import type { HarnessProblem } from "./HarnessProblem.ts";
import { HARNESS_PATHS } from "./HARNESS_PATHS.ts";

const INLINE_CODE = /(?<!`)`([^`\n]+)`(?!`)/g;

export function checkRulebookTypes(files: HarnessFiles): ReadonlyArray<HarnessProblem> {
  const { types } = collectKnownNames(files);
  return [...files.rulebookText.matchAll(INLINE_CODE)]
    .map((match) => match[1] ?? "")
    .filter((name) => !types.has(name))
    .map((name) => ({
      file: HARNESS_PATHS.rulebook,
      where: `inline code \`${name}\``,
      message: "names no type; inline code in the rulebook is only for types",
    }));
}
