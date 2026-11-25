import { CARD_NAME_WORD_SYLLABLES } from "./CARD_NAME_WORD_SYLLABLES";

const SYLLABLE_BREAK = "-";
const SOFT_HYPHEN = "\u00AD";

const HYPHENATED_WORDS: ReadonlyMap<string, string> = new Map(
  CARD_NAME_WORD_SYLLABLES.map((syllables) => [
    syllables.replaceAll(SYLLABLE_BREAK, ""),
    syllables.replaceAll(SYLLABLE_BREAK, SOFT_HYPHEN),
  ]),
);

export function hyphenatedCardName(name: string): string {
  return name.replace(/\p{L}+/gu, (word) => HYPHENATED_WORDS.get(word) ?? word);
}
