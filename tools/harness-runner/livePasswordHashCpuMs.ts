import { PASSWORD_HASHING } from "../../src/server/accounts/PASSWORD_HASHING.ts";
import { LIVE_PASSWORD_HASH_CPU } from "./LIVE_PASSWORD_HASH_CPU.ts";

const NANOSECONDS_PER_MS = 1_000_000;

export function livePasswordHashCpuMs(): number {
  const { nanosecondsPerIteration, hashesPerRequest } = LIVE_PASSWORD_HASH_CPU;
  return (
    (PASSWORD_HASHING.iterations * nanosecondsPerIteration * hashesPerRequest) / NANOSECONDS_PER_MS
  );
}
