import { collectHarnessCodes } from "./collectHarnessCodes.ts";
import type { HarnessFiles } from "./HarnessFiles.ts";
import type { HarnessProblem } from "./HarnessProblem.ts";
import { HARNESS_PATHS } from "./HARNESS_PATHS.ts";
import { isRecord } from "./isRecord.ts";

const DOCUMENTED_SECTIONS = ["given", "seat", "step", "then", "view", "stats", "marketplace_place"];

export function checkFieldsDocumented(files: HarnessFiles): ReadonlyArray<HarnessProblem> {
  const documented = collectHarnessCodes(files.harnessText).documentedWords;
  const definitions = isRecord(files.scenarioFormat)
    ? files.scenarioFormat["definitions"]
    : undefined;
  if (!isRecord(definitions)) {
    return [
      {
        file: HARNESS_PATHS.scenarioFormat,
        where: "definitions",
        message: "the format has no definitions",
      },
    ];
  }
  const problems: HarnessProblem[] = [];
  for (const section of DOCUMENTED_SECTIONS) {
    const definition = definitions[section];
    const oneOf: ReadonlyArray<unknown> =
      isRecord(definition) && Array.isArray(definition["oneOf"]) ? definition["oneOf"] : [];
    const objectShape =
      oneOf.find((shape) => isRecord(shape) && isRecord(shape["properties"])) ?? definition;
    const properties = isRecord(objectShape) ? objectShape["properties"] : undefined;
    for (const field of isRecord(properties) ? Object.keys(properties) : []) {
      if (!documented.has(field)) {
        problems.push({
          file: HARNESS_PATHS.harnessGuide,
          where: section,
          message: `field "${field}" is in the format but not explained in HARNESS.md`,
        });
      }
    }
  }
  return problems;
}
