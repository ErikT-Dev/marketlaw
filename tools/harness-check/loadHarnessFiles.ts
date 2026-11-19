import { readdirSync, readFileSync } from "node:fs";
import { parse } from "yaml";
import { HARNESS_PATHS } from "./HARNESS_PATHS.ts";
import type { HarnessFiles } from "./HarnessFiles.ts";
import type { HarnessProblem } from "./HarnessProblem.ts";
import type { ScenarioFile } from "./ScenarioFile.ts";

type LoadResult = {
  readonly files: HarnessFiles;
  readonly problems: ReadonlyArray<HarnessProblem>;
};

function readText(path: string): string {
  return readFileSync(path, "utf8");
}

function parseYamlFile(path: string, problems: HarnessProblem[]): unknown {
  try {
    return parse(readText(path));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    problems.push({ file: path, where: "whole file", message: `not valid YAML: ${message}` });
    return undefined;
  }
}

function loadScenarioFiles(problems: HarnessProblem[]): ReadonlyArray<ScenarioFile> {
  const names = readdirSync(HARNESS_PATHS.scenarios).filter((name) => name.endsWith(".yaml"));
  return names.sort().map((name) => {
    const path = `${HARNESS_PATHS.scenarios}/${name}`;
    const parsed = parseYamlFile(path, problems);
    return { path, scenarios: Array.isArray(parsed) ? parsed : [] };
  });
}

export function loadHarnessFiles(): LoadResult {
  const problems: HarnessProblem[] = [];
  const cards: unknown = JSON.parse(readText(HARNESS_PATHS.cards));
  const files: HarnessFiles = {
    scenarioFiles: loadScenarioFiles(problems),
    ruleSpecs: HARNESS_PATHS.ruleSpecs.map((spec) => ({
      path: spec.path,
      text: readText(spec.path),
    })),
    questsText: readText(HARNESS_PATHS.quests),
    influenceActionsText: readText(HARNESS_PATHS.influenceActions),
    harnessText: readText(HARNESS_PATHS.harnessGuide),
    rulebookText: readText(HARNESS_PATHS.rulebook),
    cards: Array.isArray(cards) ? cards : [],
    scenarioFormat: parseYamlFile(HARNESS_PATHS.scenarioFormat, problems),
    coverageExceptions: parseYamlFile(HARNESS_PATHS.coverageExceptions, problems),
    invariants: parseYamlFile(HARNESS_PATHS.invariants, problems),
    budgets: parseYamlFile(HARNESS_PATHS.budgets, problems),
  };
  return { files, problems };
}
