import { siteEmailLimitOf } from "../../../src/server/lobby/siteEmailLimitOf.ts";
import { takeSiteEmail } from "../../../src/server/lobby/takeSiteEmail.ts";
import type { PlayerId } from "../../../src/shared/PlayerId.ts";
import type { LobbySession } from "./LobbySession.ts";

export function lobbyEmailRejection(
  session: LobbySession,
  playerId: PlayerId | null,
  email: string,
): "email_limit_reached" | "site_daily_cap" | null {
  const overLimit = session.emails.limitRejection(playerId, email);
  if (overLimit !== null) {
    return overLimit;
  }
  const siteEmailsPerDay = siteEmailLimitOf({});
  const taken = takeSiteEmail(session.lobby, { now: session.now, siteEmailsPerDay });
  session.lobby = taken.record;
  return taken.isTaken ? null : "site_daily_cap";
}
