import { emailKeyOf } from "../../../src/server/accounts/emailKeyOf.ts";
import { nameKeyOf } from "../../../src/server/accounts/nameKeyOf.ts";
import { NO_FAILED_LOGINS } from "../../../src/server/accounts/NO_FAILED_LOGINS.ts";
import { signupProblem } from "../../../src/server/accounts/signupProblem.ts";
import type { LobbyAccount } from "./LobbyAccount.ts";
import type { LobbyRegistration } from "./LobbyRegistration.ts";
import type { LobbySession } from "./LobbySession.ts";

type SignUpBy = { readonly player: string } | { readonly visitor: string };

function textOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function isConfirmedElsewhere(session: LobbySession, email: string): boolean {
  return [...session.accounts.values()].some(
    ({ registration }) =>
      registration?.isEmailConfirmed === true &&
      registration.email !== null &&
      emailKeyOf(registration.email) === emailKeyOf(email),
  );
}

function registrationOf(session: LobbySession, step: Readonly<Record<string, unknown>>) {
  const email = textOf(step["email"]);
  const registration: LobbyRegistration = {
    password: textOf(step["password"]),
    email: isConfirmedElsewhere(session, email) ? null : email,
    isEmailConfirmed: false,
    emailEnteredMs: session.now,
    failedLogins: NO_FAILED_LOGINS,
  };
  return registration;
}

function guestOf(session: LobbySession, by: SignUpBy): LobbyAccount | null {
  return "player" in by ? (session.accounts.get(by.player) ?? null) : null;
}

function isTakenByOther(session: LobbySession, wanted: string, guest: LobbyAccount | null) {
  const ownKey = guest === null ? null : nameKeyOf(guest.identity.name);
  return [...session.accounts.keys()].some(
    (taken) => nameKeyOf(taken) === nameKeyOf(wanted) && nameKeyOf(taken) !== ownKey,
  );
}

function saveSignup(
  session: LobbySession,
  signup: { readonly name: string; readonly guest: LobbyAccount | null },
  step: Readonly<Record<string, unknown>>,
): void {
  const { name, guest } = signup;
  const playerId = guest?.identity.playerId ?? session.identityNamed(name).playerId;
  session.accounts.delete(guest?.identity.name ?? name);
  session.accounts.set(name, {
    identity: { playerId, name },
    lastUsedMs: guest?.lastUsedMs ?? session.now,
    registration: registrationOf(session, step),
  });
}

export async function signUpInLobby(
  session: LobbySession,
  by: SignUpBy,
  step: Readonly<Record<string, unknown>>,
): Promise<void> {
  const guest = guestOf(session, by);
  if ("player" in by && guest?.registration !== null) {
    session.rejected = "invalid_token";
    return;
  }
  const name = textOf(step["username"] ?? guest?.identity.name ?? session.generatedName);
  session.rejected = await signupProblem(
    { name, email: textOf(step["email"]), password: textOf(step["password"]) },
    {
      isHuman: () => Promise.resolve(step["human_check"] === "passed"),
      isTaken: (wanted) => Promise.resolve(isTakenByOther(session, wanted, guest)),
    },
  );
  if (session.rejected !== null) {
    return;
  }
  saveSignup(session, { name, guest }, step);
  if ("visitor" in by) {
    session.visitorLogins.set(by.visitor, name);
  }
}
