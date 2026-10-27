import { describe, expect, it } from "vitest";
import { QUESTS } from "../../src/shared/catalogue/QUESTS.ts";
import { TYPE_NAMES } from "../../src/shared/catalogue/TYPE_NAMES.ts";
import { collectKnownNames } from "../harness-check/collectKnownNames.ts";
import { loadHarnessFiles } from "../harness-check/loadHarnessFiles.ts";

const KNOWN = collectKnownNames(loadHarnessFiles().files);

describe("the catalogue", () => {
  it("lists exactly the quests of R20.7", () => {
    expect(QUESTS.map(({ name }) => name)).toEqual([...KNOWN.quests]);
  });

  it("gives points to exactly the types the cards use", () => {
    expect([...TYPE_NAMES].sort()).toEqual([...KNOWN.types].sort());
  });
});
