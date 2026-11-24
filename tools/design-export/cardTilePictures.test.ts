import { readdirSync, readFileSync, statSync } from "node:fs";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import { CARDS } from "../../src/shared/catalogue/CARDS.ts";
import { HARNESS_PATHS } from "../harness-check/HARNESS_PATHS.ts";
import { readBudgetEntries } from "../harness-runner/readBudgetEntries.ts";
import { CARD_TILE_PICTURE_PATHS } from "./CARD_TILE_PICTURE_PATHS.ts";

const PICTURE_LIMIT_KB = Number(
  readBudgetEntries(parse(readFileSync(HARNESS_PATHS.budgets, "utf8"))).find(
    ({ id }) => id === "B19",
  )?.limit,
);

function pictureFileOf(photo: string): string {
  return `${photo.replace(/\.[a-z]+$/i, "")}.webp`;
}

describe("the card tile pictures (B19)", () => {
  it("has a small picture for every card and nothing else", () => {
    const pictures = readdirSync(CARD_TILE_PICTURE_PATHS.pictures).sort();
    expect(pictures).toEqual([...new Set(CARDS.map(({ photo }) => pictureFileOf(photo)))].sort());
  });

  it("keeps every picture within the budget the production build copies unchanged", () => {
    const tooLarge = readdirSync(CARD_TILE_PICTURE_PATHS.pictures).filter(
      (file) =>
        statSync(`${CARD_TILE_PICTURE_PATHS.pictures}/${file}`).size > PICTURE_LIMIT_KB * 1024,
    );
    expect(Number.isFinite(PICTURE_LIMIT_KB)).toBe(true);
    expect(tooLarge).toEqual([]);
  });
});
