import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { HARNESS_PATHS } from "./HARNESS_PATHS.ts";
import type { PlayerIconFile } from "./PlayerIconFile.ts";

type PlayerIconFolder = {
  readonly files: ReadonlyArray<PlayerIconFile>;
  readonly licenceText: string | null;
};

export function readPlayerIconFolder(): PlayerIconFolder {
  const folder = HARNESS_PATHS.playerIcons;
  const paths = existsSync(folder)
    ? readdirSync(folder, { recursive: true, encoding: "utf8" })
        .map((path) => path.replaceAll("\\", "/"))
        .filter((path) => statSync(`${folder}/${path}`).isFile())
    : [];
  const files = paths.map((path) => {
    const bytes = readFileSync(`${folder}/${path}`);
    return { path, text: bytes.toString("utf8"), bytes: bytes.length };
  });
  const licence = HARNESS_PATHS.playerIconLicence;
  return { files, licenceText: existsSync(licence) ? readFileSync(licence, "utf8") : null };
}
