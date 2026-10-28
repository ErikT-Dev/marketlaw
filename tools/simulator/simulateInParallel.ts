import { availableParallelism, tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
import { build } from "vite";
import { mergeSummaries } from "./mergeSummaries.ts";
import type { SimulationSummary } from "./SimulationSummary.ts";

const WORKER_ENTRY = fileURLToPath(new URL("./simulationWorker.ts", import.meta.url));

async function bundledWorker(): Promise<string> {
  const outDir = join(tmpdir(), `marketlaw-simulator-${String(process.pid)}`);
  await build({
    configFile: false,
    logLevel: "silent",
    ssr: { noExternal: true },
    build: {
      ssr: WORKER_ENTRY,
      outDir,
      emptyOutDir: true,
      minify: false,
      rollupOptions: { output: { entryFileNames: "simulationWorker.mjs" } },
    },
  });
  return join(outDir, "simulationWorker.mjs");
}

function runWorker(
  file: string,
  firstSeed: number,
  games: number,
  lastTurn: number,
): Promise<SimulationSummary> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(file, { workerData: { firstSeed, games, lastTurn } });
    worker.once("message", (summary: SimulationSummary) => {
      resolve(summary);
    });
    worker.once("error", reject);
  });
}

export async function simulateInParallel(games: number, lastTurn: number) {
  const file = await bundledWorker();
  const workers = Math.max(1, Math.min(availableParallelism(), games));
  const perWorker = Math.ceil(games / workers);
  const slices = Array.from({ length: workers }, (unused, index) => ({
    firstSeed: index * perWorker + 1,
    games: Math.max(0, Math.min(perWorker, games - index * perWorker)),
  })).filter(({ games: count }) => count > 0);
  const summaries = await Promise.all(
    slices.map(({ firstSeed, games: count }) => runWorker(file, firstSeed, count, lastTurn)),
  );
  return mergeSummaries(summaries);
}
