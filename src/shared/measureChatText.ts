import type { MeasuredChatText } from "./MeasuredChatText";

const LINE_BREAKS_AND_CONTROL_CHARACTERS = /[\p{Cc}\u2028\u2029]/gu;
const UTF8_BYTE_STEPS = [0x80, 0x800, 0x10000];

function utf8ByteCountOf(text: string): number {
  let count = 0;
  for (const character of text) {
    const codePoint = character.codePointAt(0) ?? 0;
    count += 1 + UTF8_BYTE_STEPS.filter((step) => codePoint >= step).length;
  }
  return count;
}

export function measureChatText(typed: string): MeasuredChatText {
  const text = typed.replace(LINE_BREAKS_AND_CONTROL_CHARACTERS, " ").trim();
  const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text);
  return { text, characterCount: [...graphemes].length, byteCount: utf8ByteCountOf(text) };
}
