import type { CoverageException } from "../harness-check/CoverageException.ts";
import type { HarnessRun } from "./HarnessRun.ts";
import type { IdentifiedEntry } from "./IdentifiedEntry.ts";

export type ReportInput = {
  readonly run: HarnessRun;
  readonly problems: ReadonlyArray<string>;
  readonly ruleSpecs: ReadonlyArray<{ readonly path: string; readonly text: string }>;
  readonly exceptions: ReadonlyMap<string, CoverageException>;
  readonly invariants: ReadonlyArray<IdentifiedEntry>;
  readonly budgets: ReadonlyArray<IdentifiedEntry>;
  readonly generatedAt: string;
};
