import type { PlayerIconFile } from "./PlayerIconFile.ts";

const SVG_ENDING = ".svg";

export function picturesOfPlayerIconFolder(
  files: ReadonlyArray<PlayerIconFile>,
): ReadonlyArray<string> {
  return files
    .map(({ path }) => path)
    .filter((path) => path.endsWith(SVG_ENDING))
    .map((path) => path.slice(0, -SVG_ENDING.length))
    .sort();
}
