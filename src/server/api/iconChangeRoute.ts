import * as v from "valibot";
import { IconChangeRequest } from "../../shared/api/IconChangeRequest";
import type { IconChangeResponse } from "../../shared/api/IconChangeResponse";
import { UsernameWait } from "../../shared/api/UsernameWait";
import type { PlayerIconChoice } from "../../shared/playerIcons/PlayerIconChoice";
import { changeAllowedAtUnder } from "../accounts/changeAllowedAtUnder";
import { changesWithUnder } from "../accounts/changesWithUnder";
import { decideIconChange } from "../accounts/decideIconChange";
import { ICON_CHANGE_LIMIT } from "../accounts/ICON_CHANGE_LIMIT";
import { findIconAccount } from "../findIconAccount";
import { sha256Hex } from "../sha256Hex";
import { bodyOf } from "./bodyOf";

const ICON_CHANGE_ATTEMPTS = 3;

function json(body: IconChangeResponse, status: number): Response {
  return Response.json(body, { status });
}

function changedReply(icon: PlayerIconChoice, changesMs: ReadonlyArray<number>, now: number) {
  const allowedAt = changeAllowedAtUnder(ICON_CHANGE_LIMIT, changesMs, now);
  const iconWait = allowedAt === null ? null : v.parse(UsernameWait, { allowedAt });
  return json({ isOk: true, icon, iconWait }, 200);
}

async function changeIcon(
  env: Env,
  body: IconChangeRequest,
  attemptsLeft: number,
): Promise<Response> {
  const now = Date.now();
  const account = await findIconAccount(env.DB, await sha256Hex(body.token), now);
  if (account === null) {
    return json({ isOk: false, reason: "invalid_token" }, 401);
  }
  const { iconChangesMs: changesMs } = account;
  const decision = decideIconChange({ current: account.icon, wanted: body.icon, changesMs, now });
  if (decision.kind === "refused") {
    return json({ isOk: false, reason: decision.reason }, 400);
  }
  if (decision.kind === "unchanged") {
    return changedReply(account.icon, changesMs, now);
  }
  const changed = changesWithUnder(ICON_CHANGE_LIMIT, changesMs, now);
  const { meta } = await env.DB.prepare(
    "UPDATE players SET icon = ?, icon_changes_ms = ? WHERE id = ? AND json(icon_changes_ms) = json(?)",
  )
    .bind(
      JSON.stringify(decision.icon),
      JSON.stringify(changed),
      account.playerId,
      JSON.stringify(changesMs),
    )
    .run();
  if (meta.changes === 1) {
    return changedReply(decision.icon, changed, now);
  }
  return attemptsLeft > 1
    ? changeIcon(env, body, attemptsLeft - 1)
    : json({ isOk: false, reason: "icon_change_too_soon" }, 409);
}

export async function iconChangeRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, IconChangeRequest);
  if (body === null) {
    return json({ isOk: false, reason: "malformed_message" }, 400);
  }
  return changeIcon(env, body, ICON_CHANGE_ATTEMPTS);
}
