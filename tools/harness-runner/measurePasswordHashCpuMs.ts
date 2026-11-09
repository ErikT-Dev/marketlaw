import { hashPassword } from "../../src/server/accounts/hashPassword.ts";
import { verifyPassword } from "../../src/server/accounts/verifyPassword.ts";
import { PASSWORD_HASH_MEASUREMENT } from "./PASSWORD_HASH_MEASUREMENT.ts";

const MICROSECONDS_PER_MS = 1000;

async function hashOneBatch(storedHash: string): Promise<number> {
  const { signupsPerBatch, loginsPerBatch, password } = PASSWORD_HASH_MEASUREMENT;
  const started = process.cpuUsage();
  for (let signup = 0; signup < signupsPerBatch; signup += 1) {
    await hashPassword(password);
  }
  for (let login = 0; login < loginsPerBatch; login += 1) {
    await verifyPassword(password, storedHash);
  }
  const { user, system } = process.cpuUsage(started);
  return (user + system) / MICROSECONDS_PER_MS / (signupsPerBatch + loginsPerBatch);
}

export async function measurePasswordHashCpuMs(): Promise<ReadonlyArray<number>> {
  const storedHash = await hashPassword(PASSWORD_HASH_MEASUREMENT.password);
  const perHash: number[] = [];
  for (let batch = 0; batch < PASSWORD_HASH_MEASUREMENT.batches; batch += 1) {
    perHash.push(await hashOneBatch(storedHash));
  }
  return perHash;
}
