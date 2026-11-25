import { fileKeyOf } from "../harness-runner/fileKeyOf.ts";
import { readIdentifiedEntries } from "../harness-runner/readIdentifiedEntries.ts";
import { readRequiredList } from "../harness-runner/readRequiredList.ts";
import { HARNESS_PATHS } from "./HARNESS_PATHS.ts";
import type { HarnessFiles } from "./HarnessFiles.ts";
import type { HarnessProblem } from "./HarnessProblem.ts";
import { isRecord } from "./isRecord.ts";

type RequiredInput = Pick<HarnessFiles, "scenarioFiles" | "invariants" | "budgets" | "required">;

const NOT_REQUIRED = `not on ${HARNESS_PATHS.required}; everything must be required`;

function idsNotRequired(
  file: string,
  parsed: unknown,
  required: ReadonlyArray<string>,
): ReadonlyArray<HarnessProblem> {
  return readIdentifiedEntries(parsed)
    .filter(({ id }) => !required.includes(id))
    .map(({ id }) => ({ file, where: id, message: NOT_REQUIRED }));
}

export function checkEverythingRequired(files: RequiredInput): ReadonlyArray<HarnessProblem> {
  const requiredResult = readRequiredList(files.required);
  if (!requiredResult.isOk) {
    return requiredResult.error.map((message) => ({
      file: HARNESS_PATHS.required,
      where: "whole file",
      message,
    }));
  }
  const required = requiredResult.value;
  const scenarioProblems = files.scenarioFiles.flatMap((scenarioFile) => {
    const fileKey = fileKeyOf(scenarioFile.path);
    return scenarioFile.scenarios.flatMap((scenario) => {
      const name = isRecord(scenario) ? scenario["name"] : undefined;
      if (typeof name !== "string") {
        return [];
      }
      const isRequired = required.scenarios.some(
        (entry) => entry.file === fileKey && entry.name === name,
      );
      return isRequired ? [] : [{ file: scenarioFile.path, where: name, message: NOT_REQUIRED }];
    });
  });
  return [
    ...scenarioProblems,
    ...idsNotRequired(HARNESS_PATHS.invariants, files.invariants, required.invariants),
    ...idsNotRequired(HARNESS_PATHS.budgets, files.budgets, required.budgets),
  ];
}
