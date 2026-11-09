import type { GuestResponse } from "../../shared/api/GuestResponse";
import { UsernameChangeRequest } from "../../shared/api/UsernameChangeRequest";
import { decideUsernameChange } from "../accounts/decideUsernameChange";
import { findRenameAccount } from "../findRenameAccount";
import { renamePlayer } from "../renamePlayer";
import { sha256Hex } from "../sha256Hex";
import { bodyOf } from "./bodyOf";
import { takenNameKeys } from "./takenNameKeys";

function json(body: GuestResponse, status: number): Response {
  return Response.json(body, { status });
}

export async function usernameChangeRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, UsernameChangeRequest);
  if (body === null) {
    return json({ isOk: false, reason: "malformed_message" }, 400);
  }
  const now = Date.now();
  const account = await findRenameAccount(env.DB, await sha256Hex(body.token), now);
  if (account === null) {
    return json({ isOk: false, reason: "invalid_token" }, 401);
  }
  const { playerId, name: currentName } = account.identity;
  const change = { currentName, wantedName: body.username, changedMs: account.usernameChangedMs };
  const decision = await decideUsernameChange(
    { ...change, now },
    async (wanted) => (await takenNameKeys(env.DB, [wanted])).length > 0,
  );
  if (decision.kind === "refused") {
    return json({ isOk: false, reason: decision.reason }, 400);
  }
  const isRenamed =
    decision.kind === "unchanged" ||
    (await renamePlayer(env.DB, playerId, { name: body.username, now }));
  return isRenamed
    ? json({ isOk: true, token: body.token, playerId, name: body.username }, 200)
    : json({ isOk: false, reason: "username_taken" }, 409);
}
