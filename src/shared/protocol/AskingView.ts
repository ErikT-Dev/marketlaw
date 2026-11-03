import type { EpochMs } from "../EpochMs";

export type AskingView = {
  readonly deadline: EpochMs;
  readonly acceptedNames: ReadonlyArray<string>;
};
