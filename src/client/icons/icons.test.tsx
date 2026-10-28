import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CARDS } from "../../shared/catalogue/CARDS";
import { TYPE_NAMES } from "../../shared/catalogue/TYPE_NAMES";
import { iconUrl } from "./iconUrl";
import { photoUrl } from "./photoUrl";
import { STAT_ICONS } from "./STAT_ICONS";
import { typeIconFile } from "./typeIconFile";

function isMissing(url: string): boolean {
  const fromProjectRoot = new URL(url).pathname.replace(/^\/[A-Za-z]:/, "");
  return !existsSync(join(process.cwd(), decodeURIComponent(fromProjectRoot)));
}

describe("icons and photos", () => {
  it("has an icon for every type and every stat", () => {
    const files = [
      ...TYPE_NAMES.map(typeIconFile),
      ...Object.values(STAT_ICONS).map(({ file }) => file),
    ];
    expect(files.filter((file) => isMissing(iconUrl(file)))).toEqual([]);
  });

  it("has a photo for every card", () => {
    expect(CARDS.filter((card) => isMissing(photoUrl(card.photo))).map(({ name }) => name)).toEqual(
      [],
    );
  });
});
