import { describe, expect, it } from "vitest";
import { measureChatText } from "./measureChatText";

describe("measureChatText", () => {
  it("turns each line break, tab and control character into one space and trims the ends", () => {
    expect(measureChatText("  good\r\ngame\tnow\u0007\u2028ok  ").text).toBe("good game now  ok");
  });

  it("counts an emoji made of several code points as one character", () => {
    const family = "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}";
    expect(measureChatText(`hi ${family}`)).toEqual({
      text: `hi ${family}`,
      characterCount: 4,
      byteCount: 21,
    });
  });

  it("counts a letter with combining marks as one character and its UTF-8 bytes", () => {
    expect(measureChatText("e\u0301\u0301")).toEqual({
      text: "e\u0301\u0301",
      characterCount: 1,
      byteCount: 5,
    });
  });

  it("measures text of only spaces as empty", () => {
    expect(measureChatText(" \n\t ")).toEqual({ text: "", characterCount: 0, byteCount: 0 });
  });
});
