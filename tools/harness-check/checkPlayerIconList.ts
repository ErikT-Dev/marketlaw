import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { HARNESS_PATHS } from "./HARNESS_PATHS.ts";
import type { HarnessProblem } from "./HarnessProblem.ts";
import type { PlayerIconFile } from "./PlayerIconFile.ts";
import { picturesOfPlayerIconFolder } from "./picturesOfPlayerIconFolder.ts";
import { playerIconListText } from "./playerIconListText.ts";

export function checkPlayerIconList(
  files: ReadonlyArray<PlayerIconFile>,
): ReadonlyArray<HarnessProblem> {
  const path = HARNESS_PATHS.playerIconList;
  const wanted = playerIconListText(picturesOfPlayerIconFolder(files));
  const current = existsSync(path) ? readFileSync(path, "utf8").replaceAll("\r\n", "\n") : null;
  if (current === wanted) {
    return [];
  }
  writeFileSync(path, wanted);
  return [
    {
      file: path,
      where: "whole file",
      message: `the list of pictures differed from the folder ${HARNESS_PATHS.playerIcons}/ and is written again now; commit it`,
    },
  ];
}
