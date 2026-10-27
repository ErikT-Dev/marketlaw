import { isAbsolute, relative } from "node:path";
import { isRecord } from "../harness-check/isRecord.ts";

export function editedFilePath(input: Readonly<Record<string, unknown>>): string | undefined {
  const toolInput = input["tool_input"];
  if (!isRecord(toolInput)) {
    return undefined;
  }
  const path = toolInput["file_path"] ?? toolInput["notebook_path"];
  if (typeof path !== "string") {
    return undefined;
  }
  const projectPath = isAbsolute(path) ? relative(process.cwd(), path) : path;
  return projectPath.replaceAll("\\", "/");
}
