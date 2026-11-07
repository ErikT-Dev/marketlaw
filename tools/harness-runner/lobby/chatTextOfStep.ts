const EMOJI = String.fromCodePoint(0x1f600);
const TWO_BYTE_MARK = String.fromCodePoint(0x301);
const THREE_BYTE_MARK = String.fromCodePoint(0x20d0);

function byteCountOf(text: string): number {
  return new TextEncoder().encode(text).length;
}

function paddedToBytes(text: string, bytes: number): string {
  const extra = bytes - byteCountOf(text);
  if (extra < 2) {
    throw new Error(`a chat text of ${String(bytes)} bytes cannot be made from "${text}"`);
  }
  const oddMark = extra % 2 === 0 ? "" : THREE_BYTE_MARK;
  const twoByteMarks = TWO_BYTE_MARK.repeat((extra - byteCountOf(oddMark)) / 2);
  const [first = "", ...rest] = text;
  return [first, oddMark, twoByteMarks, ...rest].join("");
}

export function chatTextOfStep(step: Readonly<Record<string, unknown>>): string {
  if (typeof step["text"] === "string") {
    return step["text"];
  }
  const length = typeof step["text_length"] === "number" ? step["text_length"] : 1;
  const text = (step["text_kind"] === "emoji" ? EMOJI : "a").repeat(length);
  return typeof step["text_bytes"] === "number" ? paddedToBytes(text, step["text_bytes"]) : text;
}
