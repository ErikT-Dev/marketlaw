import { availableParallelism } from "node:os";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
import { bundleForNode } from "../bundleForNode.ts";
import { mergeSummaries } from "./mergeSummaries.ts";
import type { SimulationSummary } from "./SimulationSummary.ts";

const WORKER_ENTRY = fileURLToPath(new URL("./simulationWorker.ts", import.meta.url));

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
    worker.once("exit", (code) => {
      reject(new Error(`a simulator worker stopped with code ${String(code)} before reporting`));
    });
  });
}

export async function simulateInParallel(games: number, lastTurn: number) {
  const file = await bundleForNode(WORKER_ENTRY, "simulationWorker");
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
