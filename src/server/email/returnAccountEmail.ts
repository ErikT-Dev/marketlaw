import type { EpochMs } from "../../shared/EpochMs";
import { lobbyOf } from "../lobbyOf";
import { returnEmailCounts } from "./returnEmailCounts";

export async function returnAccountEmail(
  env: Env,
  countedKeys: ReadonlyArray<string>,
  now: EpochMs,
): Promise<void> {
  await returnEmailCounts(env.DB, countedKeys, now);
  await lobbyOf(env).returnEmailQuota(now);
}
