import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { DESIGN_EXPORT_PATHS } from "./DESIGN_EXPORT_PATHS.ts";

export function readPenpotToken(): string {
  const raw = readFileSync(join(homedir(), DESIGN_EXPORT_PATHS.penpotToken), "utf8");
  return raw.replace(/^\uFEFF/, "").trim();
}
