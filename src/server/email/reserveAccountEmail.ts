import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import { lobbyOf } from "../lobbyOf";
import { emailCountsToday } from "./emailCountsToday";
import { emailLimitRejection } from "./emailLimitRejection";

export async function reserveAccountEmail(
  env: Env,
  reserved: { readonly playerId: PlayerId | null; readonly address: string; readonly now: EpochMs },
): Promise<"email_limit_reached" | "site_daily_cap" | null> {
  const overLimit = emailLimitRejection(await emailCountsToday(env.DB, reserved));
  if (overLimit !== null) {
    return overLimit;
  }
  return (await lobbyOf(env).takeEmailQuota(reserved.now)) ? null : "site_daily_cap";
}
