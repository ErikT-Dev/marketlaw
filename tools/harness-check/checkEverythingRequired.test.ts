import { describe, expect, it } from "vitest";
import { checkEverythingRequired } from "./checkEverythingRequired.ts";
import { HARNESS_PATHS } from "./HARNESS_PATHS.ts";
import { loadHarnessFiles } from "./loadHarnessFiles.ts";

const SCENARIO_PATH = `${HARNESS_PATHS.scenarios}/drawing.yaml`;
const NOT_REQUIRED = `not on ${HARNESS_PATHS.required}; everything must be required`;

const SMALL_HARNESS = {
  scenarioFiles: [
    { path: SCENARIO_PATH, scenarios: [{ name: "draws a card" }, { name: "draws two cards" }] },
  ],
  invariants: [{ id: "I1" }, { id: "I2" }],
  budgets: [{ id: "B1" }, { id: "B2" }],
};

const EVERYTHING_REQUIRED = {
  scenarios: { drawing: ["draws a card", "draws two cards"] },
  invariants: ["I1", "I2"],
  budgets: ["B1", "B2"],
};

describe("the check that everything is required", () => {
  it("passes the harness in the repository", () => {
    const { files } = loadHarnessFiles();
    expect(checkEverythingRequired(files)).toEqual([]);
  });

  it("passes when every scenario, invariant and budget is on the list", () => {
    expect(checkEverythingRequired({ ...SMALL_HARNESS, required: EVERYTHING_REQUIRED })).toEqual(
      [],
    );
  });

  it("reports a scenario, an invariant and a budget that are not on the list", () => {
    const required = {
      scenarios: { drawing: ["draws a card"] },
      invariants: ["I1"],
      budgets: ["B2"],
    };
    expect(checkEverythingRequired({ ...SMALL_HARNESS, required })).toEqual([
      { file: SCENARIO_PATH, where: "draws two cards", message: NOT_REQUIRED },
      { file: HARNESS_PATHS.invariants, where: "I2", message: NOT_REQUIRED },
      { file: HARNESS_PATHS.budgets, where: "B1", message: NOT_REQUIRED },
    ]);
  });

  it("reports a scenario whose name is on the list under another file", () => {
    const required = {
      ...EVERYTHING_REQUIRED,
      scenarios: { quests: ["draws a card", "draws two cards"] },
    };
    expect(
      checkEverythingRequired({ ...SMALL_HARNESS, required }).map(({ where }) => where),
    ).toEqual(["draws a card", "draws two cards"]);
  });

  it("reports a required list that cannot be read", () => {
    const problems = checkEverythingRequired({ ...SMALL_HARNESS, required: { scenarios: [] } });
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.every(({ file }) => file === HARNESS_PATHS.required)).toBe(true);
  });
});
