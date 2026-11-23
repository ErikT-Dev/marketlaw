import { playerIconArtistsOf } from "../../src/shared/playerIcons/playerIconArtistsOf.ts";
import { HARNESS_PATHS } from "./HARNESS_PATHS.ts";
import type { HarnessProblem } from "./HarnessProblem.ts";
import type { PlayerIconFile } from "./PlayerIconFile.ts";

const LICENCE_FILE = "license.txt";
const PICTURE_PATH = /^([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-z0-9]+(?:-[a-z0-9]+)*)\.svg$/u;
const MAX_PICTURE_BYTES = 20 * 1024;
const SVG_START = /^\s*(?:<\?xml[^>]*\?>\s*)?<svg\b([^>]*)>/u;
const SCRIPT = /<script\b|\son[a-z]+\s*=|javascript:/iu;
const OUTSIDE_REFERENCE =
  /(?:href|src)\s*=\s*["'](?!#)|url\(\s*["']?(?!#)|@import|<foreignObject\b/iu;

function problemOf(path: string, message: string): HarnessProblem {
  return { file: `${HARNESS_PATHS.playerIcons}/${path}`, where: "whole file", message };
}

function pictureProblems(
  file: PlayerIconFile,
  licensedFolders: ReadonlyArray<string>,
): ReadonlyArray<HarnessProblem> {
  const match = PICTURE_PATH.exec(file.path);
  if (match === null) {
    return [problemOf(file.path, "not an SVG picture inside an artist folder")];
  }
  const svgStart = SVG_START.exec(file.text);
  const checks: ReadonlyArray<readonly [boolean, string]> = [
    [svgStart === null, "not an SVG file"],
    [svgStart !== null && !/\sviewBox\s*=/u.test(svgStart[1] ?? ""), "the SVG has no viewBox"],
    [file.bytes > MAX_PICTURE_BYTES, "the SVG is over 20 KB"],
    [SCRIPT.test(file.text), "the SVG holds a script"],
    [OUTSIDE_REFERENCE.test(file.text), "the SVG refers to something outside it"],
    [
      !licensedFolders.includes(match[1] ?? ""),
      `the licence file does not name the artist of the folder "${match[1] ?? ""}"`,
    ],
  ];
  return checks
    .filter(([isProblem]) => isProblem)
    .map(([, message]) => problemOf(file.path, message));
}

export function checkPlayerIconFolder(
  files: ReadonlyArray<PlayerIconFile>,
  licenceText: string | null,
): ReadonlyArray<HarnessProblem> {
  const licensedFolders = playerIconArtistsOf(licenceText ?? "").map(({ folder }) => folder);
  const missingLicence =
    licenceText === null ? [problemOf(LICENCE_FILE, "the folder has no licence file")] : [];
  const pictures = files.filter(({ path }) => path !== LICENCE_FILE);
  const empty = pictures.length === 0 ? [problemOf("", "the folder has no pictures")] : [];
  return [
    ...missingLicence,
    ...empty,
    ...pictures.flatMap((file) => pictureProblems(file, licensedFolders)),
  ];
}
