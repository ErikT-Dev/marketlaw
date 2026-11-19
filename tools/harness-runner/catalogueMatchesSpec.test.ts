import { describe, expect, it } from "vitest";
import { QUEST_LINES } from "../../src/shared/ruleFiles/QUEST_LINES.ts";
import { TYPE_NAMES } from "../../src/shared/catalogue/TYPE_NAMES.ts";
import { collectKnownNames } from "../harness-check/collectKnownNames.ts";
import { loadHarnessFiles } from "../harness-check/loadHarnessFiles.ts";

const KNOWN = collectKnownNames(loadHarnessFiles().files);

describe("the catalogue", () => {
  it("lists exactly the quests of quests.txt", () => {
    expect(QUEST_LINES.map(({ name }) => name)).toEqual([...KNOWN.quests]);
  });

  it("gives points to exactly the types the cards use", () => {
    expect([...TYPE_NAMES].sort()).toEqual([...KNOWN.types].sort());
  });
});
