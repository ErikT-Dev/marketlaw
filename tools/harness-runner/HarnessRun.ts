import type { BusyDayCount } from "../simulator/busyDay/BusyDayCount.ts";
import type { SimulationSummary } from "../simulator/SimulationSummary.ts";
import type { RequiredList } from "./RequiredList.ts";
import type { ScenarioRun } from "./ScenarioRun.ts";

export type HarnessRun = {
  readonly required: RequiredList;
  readonly runs: ReadonlyArray<ScenarioRun>;
  readonly invariantIds: ReadonlyArray<string>;
  readonly budgetIds: ReadonlyArray<string>;
  readonly cardDataProblems: ReadonlyArray<string>;
  readonly tierShareProblems: ReadonlyArray<string>;
  readonly replayExportProblems: ReadonlyArray<string>;
  readonly simulation: SimulationSummary;
  readonly busyDay: BusyDayCount | null;
  readonly passwordHashCpuMs: ReadonlyArray<number>;
  readonly simulatedInvariants: ReadonlyArray<string>;
};
