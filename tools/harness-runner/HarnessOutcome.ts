import type { HarnessRun } from "./HarnessRun.ts";

export type HarnessOutcome = {
  readonly run: HarnessRun;
  readonly problems: ReadonlyArray<string>;
};
