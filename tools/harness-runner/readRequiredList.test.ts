import { describe, expect, it } from "vitest";
import { readRequiredList } from "./readRequiredList.ts";

describe("readRequiredList", () => {
  it("reads scenarios by file and name, invariants and budgets", () => {
    const parsed = {
      scenarios: { setup: ["deals hands", "picks seats"], drawing: ["draws a card"] },
      invariants: ["I1"],
      budgets: ["B4"],
    };
    expect(readRequiredList(parsed)).toEqual({
      isOk: true,
      value: {
        scenarios: [
          { file: "setup", name: "deals hands" },
          { file: "setup", name: "picks seats" },
          { file: "drawing", name: "draws a card" },
        ],
        invariants: ["I1"],
        budgets: ["B4"],
      },
    });
  });

  it("rejects a file without one of the three lists", () => {
    expect(readRequiredList({ scenarios: {}, invariants: [] })).toEqual({
      isOk: false,
      error: ['required.yaml budgets: Invalid key: Expected "budgets" but received undefined'],
    });
  });
});
