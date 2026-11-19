import { describe, expect, it } from "vitest";
import { checkCodesAndActions } from "./checkCodesAndActions.ts";
import { checkNames } from "./checkNames.ts";
import { HARNESS_PATHS } from "./HARNESS_PATHS.ts";
import { loadHarnessFiles } from "./loadHarnessFiles.ts";

const SCENARIO = {
  name: "names from the rule files",
  given: { quest_list: ["Working district", "Ghost town"] },
  when: [
    { action: "influence", trade: "influence_to_funds" },
    { action: "influence", trade: "skip_build" },
  ],
  then: {},
};

const FILES = {
  ...loadHarnessFiles().files,
  scenarioFiles: [{ path: "harness/scenarios/test.yaml", scenarios: [SCENARIO] }],
};

describe("names a scenario takes from the rule files", () => {
  it("reports a quest that quests.txt does not have", () => {
    expect(checkNames(FILES)).toEqual([
      {
        file: "harness/scenarios/test.yaml",
        where: SCENARIO.name,
        message: 'unknown quest name "Ghost town"',
      },
    ]);
  });

  it("reports an influence action that influence-actions.txt does not have", () => {
    expect(checkCodesAndActions(FILES)).toContainEqual({
      file: "harness/scenarios/test.yaml",
      where: SCENARIO.name,
      message: `influence trade "skip_build" is not in ${HARNESS_PATHS.influenceActions}`,
    });
    expect(
      checkCodesAndActions(FILES).filter(({ message }) => message.includes("influence_to_funds")),
    ).toEqual([]);
  });
});
