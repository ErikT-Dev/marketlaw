import { mkdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const LOCK_PATH = join(tmpdir(), "marketlaw-ranked-queue-e2e.lock");
const STALE_LOCK_MS = 300_000;
const RETRY_MS = 500;

async function isStale(): Promise<boolean> {
  try {
    const { mtimeMs } = await stat(LOCK_PATH);
    return Date.now() - mtimeMs > STALE_LOCK_MS;
  } catch {
    return false;
  }
}

async function tryToTakeLock(): Promise<boolean> {
  try {
    await mkdir(LOCK_PATH);
    return true;
  } catch {
    if (await isStale()) {
      await rm(LOCK_PATH, { recursive: true, force: true });
    }
    return false;
  }
}

async function takeLock(): Promise<void> {
  while (!(await tryToTakeLock())) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_MS));
  }
}

export async function withRankedQueueLock(useQueue: () => Promise<void>): Promise<void> {
  await takeLock();
  try {
    await useQueue();
  } finally {
    await rm(LOCK_PATH, { recursive: true, force: true });
  }
}
