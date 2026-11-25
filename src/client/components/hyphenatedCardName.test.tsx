import { describe, expect, it } from "vitest";
import { CARD_NAMES } from "../../shared/catalogue/CARD_NAMES";
import { CARD_NAME_WORD_SYLLABLES } from "./CARD_NAME_WORD_SYLLABLES";
import { hyphenatedCardName } from "./hyphenatedCardName";

const SOFT_HYPHEN = "\u00AD";
const LONGEST_WORD_WITHOUT_BREAKS = 8;

function wordsOf(name: string): ReadonlyArray<string> {
  return name.match(/\p{L}+/gu) ?? [];
}

describe("hyphenatedCardName", () => {
  it("puts a soft hyphen at every syllable break of a long word", () => {
    expect(hyphenatedCardName("Telecommunication Industry")).toBe(
      `Tele${SOFT_HYPHEN}com${SOFT_HYPHEN}mu${SOFT_HYPHEN}ni${SOFT_HYPHEN}ca${SOFT_HYPHEN}tion Industry`,
    );
  });

  it("hyphenates each part of a word joined by a hyphen", () => {
    expect(hyphenatedCardName("Ultra-Processed Food")).toBe(`Ultra-Pro${SOFT_HYPHEN}cessed Food`);
  });

  it("keeps every card name as it is apart from the soft hyphens", () => {
    for (const name of CARD_NAMES) {
      expect(hyphenatedCardName(name).replaceAll(SOFT_HYPHEN, "")).toBe(name);
    }
  });

  it("gives every word longer than 8 letters in a card name its syllable breaks", () => {
    const wordsWithoutBreaks = CARD_NAMES.flatMap((name) =>
      wordsOf(hyphenatedCardName(name)).filter((word) => word.length > LONGEST_WORD_WITHOUT_BREAKS),
    );
    expect(wordsWithoutBreaks).toEqual([]);
  });

  it("lists only words that are in a card name, each once", () => {
    const cardWords = new Set(CARD_NAMES.flatMap(wordsOf));
    const listedWords = CARD_NAME_WORD_SYLLABLES.map((syllables) => syllables.replaceAll("-", ""));
    expect(listedWords.filter((word) => !cardWords.has(word))).toEqual([]);
    expect(new Set(listedWords).size).toBe(listedWords.length);
  });
});
