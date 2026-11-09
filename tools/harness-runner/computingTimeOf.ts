import type { ComputingTime } from "./ComputingTime.ts";
import type { HarnessRun } from "./HarnessRun.ts";
import { percentileOf } from "./percentileOf.ts";

export function computingTimeOf(run: HarnessRun): ComputingTime {
  const messageMs = run.runs.flatMap(({ measurements }) =>
    measurements.filter(({ budget }) => budget === "B11").map(({ value }) => value),
  );
  return {
    roomMessagesMs: messageMs.length === 0 ? undefined : Math.ceil(percentileOf(messageMs, 0.99)),
    passwordHashMs: run.passwordHashCpuMs === null ? undefined : Math.ceil(run.passwordHashCpuMs),
  };
}
