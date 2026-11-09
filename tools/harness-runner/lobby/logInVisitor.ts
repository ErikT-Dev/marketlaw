import { decideLogin } from "../../../src/server/accounts/decideLogin.ts";
import { emailKeyOf } from "../../../src/server/accounts/emailKeyOf.ts";
import { loginLookupOf } from "../../../src/server/accounts/loginLookupOf.ts";
import type { LoginLookup } from "../../../src/server/accounts/LoginLookup.ts";
import { nameKeyOf } from "../../../src/server/accounts/nameKeyOf.ts";
import { NO_FAILED_LOGINS } from "../../../src/server/accounts/NO_FAILED_LOGINS.ts";
import type { LobbyAccount } from "./LobbyAccount.ts";
import type { LobbyRegistration } from "./LobbyRegistration.ts";
import type { LobbySession } from "./LobbySession.ts";

type RegisteredAccount = {
  readonly account: LobbyAccount;
  readonly registration: LobbyRegistration;
  readonly failedLogins: LobbyRegistration["failedLogins"];
};

function textOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function isFound(lookup: LoginLookup, { account, registration }: RegisteredAccount): boolean {
  return lookup.by === "name"
    ? nameKeyOf(account.identity.name) === lookup.key
    : registration.email !== null && emailKeyOf(registration.email) === lookup.key;
}

function accountFor(session: LobbySession, login: string): RegisteredAccount | null {
  const lookup = loginLookupOf(login);
  const found = [...session.accounts.values()]
    .flatMap((account) =>
      account.registration === null
        ? []
        : [
            {
              account,
              registration: account.registration,
              failedLogins: account.registration.failedLogins,
            },
          ],
    )
    .filter((candidate) => isFound(lookup, candidate))
    .sort(
      (left, right) =>
        Number(right.registration.isEmailConfirmed) - Number(left.registration.isEmailConfirmed) ||
        left.registration.emailEnteredMs - right.registration.emailEnteredMs,
    );
  return found[0] ?? null;
}

function withFailedLogins(
  { account, registration }: RegisteredAccount,
  failedLogins: LobbyRegistration["failedLogins"],
): LobbyAccount {
  return { ...account, registration: { ...registration, failedLogins } };
}

export async function logInVisitor(
  session: LobbySession,
  visitor: string,
  step: Readonly<Record<string, unknown>>,
): Promise<void> {
  const password = textOf(step["password"]);
  const decision = await decideLogin(accountFor(session, textOf(step["login"])), {
    now: session.now,
    isHuman: () => Promise.resolve(step["human_check"] === "passed"),
    isPasswordRight: (found) => Promise.resolve(found?.registration.password === password),
  });
  if (decision.kind === "logged_in") {
    const { name } = decision.account.account.identity;
    session.accounts.set(name, withFailedLogins(decision.account, NO_FAILED_LOGINS));
    session.visitorLogins.set(visitor, name);
    return;
  }
  if (decision.kind === "wrong_password") {
    const { account } = decision.account;
    session.accounts.set(
      account.identity.name,
      withFailedLogins(decision.account, decision.failedLogins),
    );
  }
  session.rejected = decision.kind === "human_check_failed" ? "human_check_failed" : "login_failed";
}
