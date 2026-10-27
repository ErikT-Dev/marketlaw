import { spawnSync } from "node:child_process";
import { editedFilePath } from "./editedFilePath.ts";
import { readHookInput } from "./readHookInput.ts";

const LINTED_FILE = /\.(ts|tsx|js)$/;
const ESLINT = "node_modules/eslint/bin/eslint.js";

export async function lintEditedFile(): Promise<void> {
  const path = editedFilePath(await readHookInput());
  if (path === undefined || !LINTED_FILE.test(path) || path.startsWith("../")) {
    return;
  }
  const result = spawnSync(process.execPath, [ESLINT, "--no-warn-ignored", path], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    process.stderr.write(`ESLint found problems in ${path}:\n${result.stdout}${result.stderr}`);
    process.exitCode = 2;
  }
}

await lintEditedFile();
