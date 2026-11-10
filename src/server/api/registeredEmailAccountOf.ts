import type { EmailResponse } from "../../shared/api/EmailResponse";
import type { EmailAccount } from "../email/EmailAccount";
import { findEmailAccount } from "../email/findEmailAccount";
import { sha256Hex } from "../sha256Hex";

function refusal(body: EmailResponse, status: number): Response {
  return Response.json(body, { status });
}

export async function registeredEmailAccountOf(
  db: D1Database,
  token: string,
  now: number,
): Promise<EmailAccount | Response> {
  const account = await findEmailAccount(db, await sha256Hex(token), now);
  if (account === null) {
    return refusal({ isOk: false, reason: "invalid_token" }, 401);
  }
  return account.isGuest ? refusal({ isOk: false, reason: "not_registered" }, 400) : account;
}
