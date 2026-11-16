import type { GuestResponse } from "../../shared/api/GuestResponse";
import { UsernameChangeRequest } from "../../shared/api/UsernameChangeRequest";
import { decideUsernameChange } from "../accounts/decideUsernameChange";
import { USERNAME_CHANGES_IN_WAIT } from "../accounts/USERNAME_CHANGES_IN_WAIT";
import { findRenameAccount } from "../findRenameAccount";
import type { RenameAccount } from "../RenameAccount";
import { renamePlayer } from "../renamePlayer";
import { sha256Hex } from "../sha256Hex";
import { bodyOf } from "./bodyOf";
import { takenNameKeys } from "./takenNameKeys";

type UsernameChangeAttempt = {
  readonly token: string;
  readonly tokenHash: string;
  readonly username: string;
  readonly now: number;
};

function json(body: GuestResponse, status: number): Response {
  return Response.json(body, { status });
}

function isSameList(first: ReadonlyArray<number>, second: ReadonlyArray<number>): boolean {
  return first.length === second.length && first.every((value, index) => value === second[index]);
}

async function changeUsername(
  db: D1Database,
  attempt: UsernameChangeAttempt,
  attemptsLeft: number,
): Promise<Response> {
  const account = await findRenameAccount(db, attempt.tokenHash, attempt.now);
  if (account === null) {
    return json({ isOk: false, reason: "invalid_token" }, 401);
  }
  const { playerId, name: currentName } = account.identity;
  const renamed = json({ isOk: true, token: attempt.token, playerId, name: attempt.username }, 200);
  const decision = await decideUsernameChange(
    {
      currentName,
      wantedName: attempt.username,
      changesMs: account.usernameChangesMs,
      now: attempt.now,
    },
    async (wanted) => (await takenNameKeys(db, [wanted])).length > 0,
  );
  if (decision.kind === "refused") {
    return json({ isOk: false, reason: decision.reason }, 400);
  }
  if (decision.kind === "unchanged") {
    return renamed;
  }
  const change = { name: attempt.username, now: attempt.now, changesMs: account.usernameChangesMs };
  if (await renamePlayer(db, playerId, change)) {
    return renamed;
  }
  return attemptsLeft > 1 && (await isChangedMeanwhile(db, attempt, account))
    ? changeUsername(db, attempt, attemptsLeft - 1)
    : json({ isOk: false, reason: "username_taken" }, 409);
}

async function isChangedMeanwhile(
  db: D1Database,
  attempt: UsernameChangeAttempt,
  account: RenameAccount,
): Promise<boolean> {
  const latest = await findRenameAccount(db, attempt.tokenHash, attempt.now);
  return latest !== null && !isSameList(latest.usernameChangesMs, account.usernameChangesMs);
}

export async function usernameChangeRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, UsernameChangeRequest);
  if (body === null) {
    return json({ isOk: false, reason: "malformed_message" }, 400);
  }
  const attempt = {
    token: body.token,
    tokenHash: await sha256Hex(body.token),
    username: body.username,
    now: Date.now(),
  };
  return changeUsername(env.DB, attempt, USERNAME_CHANGES_IN_WAIT + 1);
}
