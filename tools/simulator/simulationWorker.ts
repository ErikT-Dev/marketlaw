import { parentPort, workerData } from "node:worker_threads";
import * as v from "valibot";
import { simulateSlice } from "./simulateSlice.ts";

const SLICE = v.object({ firstSeed: v.number(), games: v.number(), lastTurn: v.number() });

const slice = v.parse(SLICE, workerData);
parentPort?.postMessage(simulateSlice(slice.firstSeed, slice.games, slice.lastTurn));
