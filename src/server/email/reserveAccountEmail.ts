import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import { lobbyOf } from "../lobbyOf";
import { accountCountKeyOf } from "./accountCountKeyOf";
import { addressCountKeyOf } from "./addressCountKeyOf";
import type { EmailReservation } from "./EmailReservation";
import { returnEmailCounts } from "./returnEmailCounts";
import { takeEmailCounts } from "./takeEmailCounts";

export async function reserveAccountEmail(
  env: Env,
  reserved: { readonly playerId: PlayerId | null; readonly address: string; readonly now: EpochMs },
): Promise<EmailReservation> {
  const { playerId, now } = reserved;
  const countedKeys = [
    ...(playerId === null ? [] : [accountCountKeyOf(playerId)]),
    await addressCountKeyOf(reserved.address),
  ];
  if (!(await takeEmailCounts(env.DB, countedKeys, now))) {
    return { isOk: false, reason: "email_limit_reached" };
  }
  if (!(await lobbyOf(env).takeEmailQuota(now))) {
    await returnEmailCounts(env.DB, countedKeys, now);
    return { isOk: false, reason: "site_daily_cap" };
  }
  return { isOk: true, countedKeys };
}
