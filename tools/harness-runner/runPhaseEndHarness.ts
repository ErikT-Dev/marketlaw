import { spawnSync } from "node:child_process";
import { PHASE_END_RUN } from "./PHASE_END_RUN.ts";

export function runPhaseEndHarness(): void {
  const result = spawnSync("vitest run --project engine tools/harness-runner/harness.test.ts", {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, [PHASE_END_RUN.variable]: PHASE_END_RUN.value },
  });
  process.exitCode = result.status ?? 1;
}

runPhaseEndHarness();
