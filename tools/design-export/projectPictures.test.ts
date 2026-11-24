import { readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PROJECT_PICTURE_PATHS } from "./PROJECT_PICTURE_PATHS.ts";

const PROJECT_PICTURE_LIMIT_KB = 80;

describe("the project pictures (S8.2)", () => {
  it("has one picture for each of the three projects", () => {
    expect(readdirSync(PROJECT_PICTURE_PATHS.pictures).sort()).toEqual([
      "clean-the-streets.webp",
      "culture-campaign.webp",
      "help-the-homeless.webp",
    ]);
  });

  it("keeps every picture at 80 KB or less", () => {
    const tooLarge = readdirSync(PROJECT_PICTURE_PATHS.pictures).filter(
      (file) =>
        statSync(`${PROJECT_PICTURE_PATHS.pictures}/${file}`).size >
        PROJECT_PICTURE_LIMIT_KB * 1024,
    );
    expect(tooLarge).toEqual([]);
  });
});
