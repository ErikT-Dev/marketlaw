import { describe, expect, it } from "vitest";
import { DRIVERS } from "./DRIVERS.ts";
import { runHarness } from "./runHarness.ts";

const OUTCOME = runHarness(DRIVERS);

describe("the harness", () => {
  it("reads all 425 scenarios", () => {
    expect(OUTCOME.run.runs).toHaveLength(425);
  });

  it("passes everything on the required list", () => {
    expect(OUTCOME.problems).toEqual([]);
  });
});
