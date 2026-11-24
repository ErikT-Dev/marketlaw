import { describe, expect, it } from "vitest";
import { checkPlayerIconFolder } from "./checkPlayerIconFolder.ts";
import { readPlayerIconFolder } from "./readPlayerIconFolder.ts";

const LICENCE =
  "Icons by:\n\n- Lorc, http://lorcblog.blogspot.com\n- Zeromancer - CC0\n- Caro Asercion\n";
const GOOD_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#fff" d="M0 0h1v1z"/></svg>';

function messagesOf(path: string, text: string, bytes = text.length): ReadonlyArray<string> {
  return checkPlayerIconFolder([{ path, text, bytes }], LICENCE).map(({ message }) => message);
}

describe("the player icon folder check", () => {
  it("passes the folder in the repository", () => {
    const { files, licenceText } = readPlayerIconFolder();
    expect(checkPlayerIconFolder(files, licenceText)).toEqual([]);
  });

  it("passes a small SVG with a viewBox in a folder the licence names", () => {
    expect(messagesOf("lorc/bat.svg", GOOD_SVG)).toEqual([]);
    expect(messagesOf("zeromancer/owl.svg", GOOD_SVG)).toEqual([]);
    expect(messagesOf("caro-asercion/fox-head.svg", GOOD_SVG)).toEqual([]);
  });

  it("rejects a file that is not an SVG", () => {
    expect(messagesOf("lorc/bat.png", "PNG")).toEqual([
      "not an SVG picture inside an artist folder",
    ]);
    expect(messagesOf("lorc/bat.svg", "<html></html>")).toEqual(["not an SVG file"]);
  });

  it("rejects a picture outside an artist folder", () => {
    expect(messagesOf("bat.svg", GOOD_SVG)).toEqual(["not an SVG picture inside an artist folder"]);
  });

  it("rejects an SVG without a viewBox", () => {
    expect(messagesOf("lorc/bat.svg", '<svg width="10"><path d="M0 0"/></svg>')).toEqual([
      "the SVG has no viewBox",
    ]);
  });

  it("rejects an SVG over 20 KB", () => {
    expect(messagesOf("lorc/bat.svg", GOOD_SVG, 20 * 1024 + 1)).toEqual(["the SVG is over 20 KB"]);
  });

  it("rejects an SVG with a script", () => {
    const withScript = GOOD_SVG.replace("</svg>", "<script>alert(1)</script></svg>");
    const withHandler = GOOD_SVG.replace("<path", '<path onload="alert(1)"');
    expect(messagesOf("lorc/bat.svg", withScript)).toEqual(["the SVG holds a script"]);
    expect(messagesOf("lorc/bat.svg", withHandler)).toEqual(["the SVG holds a script"]);
  });

  it("rejects an SVG that refers to something outside it", () => {
    const withImage = GOOD_SVG.replace("</svg>", '<image href="https://example.com/a.png"/></svg>');
    const withUrl = GOOD_SVG.replace('fill="#fff"', 'style="fill:url(other.svg#a)"');
    expect(messagesOf("lorc/bat.svg", withImage)).toEqual([
      "the SVG refers to something outside it",
    ]);
    expect(messagesOf("lorc/bat.svg", withUrl)).toEqual(["the SVG refers to something outside it"]);
  });

  it("accepts a reference inside the SVG", () => {
    const withInside = GOOD_SVG.replace('fill="#fff"', 'fill="url(#gradient)"');
    expect(messagesOf("lorc/bat.svg", withInside)).toEqual([]);
  });

  it("rejects a picture by an artist the licence does not name", () => {
    expect(messagesOf("someone/bat.svg", GOOD_SVG)).toEqual([
      'the licence file does not name the artist of the folder "someone"',
    ]);
  });

  it("rejects a folder without a licence file", () => {
    const files = [{ path: "lorc/bat.svg", text: GOOD_SVG, bytes: GOOD_SVG.length }];
    expect(checkPlayerIconFolder(files, null).map(({ message }) => message)).toEqual([
      "the folder has no licence file",
      'the licence file does not name the artist of the folder "lorc"',
    ]);
  });
});
