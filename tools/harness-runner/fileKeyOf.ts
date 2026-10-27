import { HARNESS_PATHS } from "../harness-check/HARNESS_PATHS.ts";

export function fileKeyOf(path: string): string {
  return path.replace(`${HARNESS_PATHS.scenarios}/`, "").replace(".yaml", "");
}
