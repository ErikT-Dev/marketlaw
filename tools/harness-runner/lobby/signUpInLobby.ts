import { nameKeyOf } from "../../../src/server/accounts/nameKeyOf.ts";
import { NO_FAILED_LOGINS } from "../../../src/server/accounts/NO_FAILED_LOGINS.ts";
import { signupProblem } from "../../../src/server/accounts/signupProblem.ts";
import type { ReasonCode } from "../../../src/shared/ReasonCode.ts";
import type { LobbyAccount } from "./LobbyAccount.ts";
import { accountConfirmingEmail } from "./accountConfirmingEmail.ts";
import { lobbyEmailRejection } from "./lobbyEmailRejection.ts";
import type { LobbyRegistration } from "./LobbyRegistration.ts";
import type { LobbySession } from "./LobbySession.ts";

type SignUpBy = { readonly player: string } | { readonly visitor: string };

function textOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function registrationOf(session: LobbySession, step: Readonly<Record<string, unknown>>) {
  const email = textOf(step["email"]);
  const registration: LobbyRegistration = {
    password: textOf(step["password"]),
    email,
    isEmailConfirmed: false,
    pendingEmail: null,
    emailEnteredMs: session.now,
    failedLogins: NO_FAILED_LOGINS,
  };
  return registration;
}

function sendSignupEmail(session: LobbySession, name: string, email: string, isElsewhere: boolean) {
  const kind = isElsewhere ? "already_in_use" : "confirm";
  session.emails.send(session.identityNamed(name).playerId, { to: email, kind }, session.now);
  session.emails.noticesTo.set(name, "signup_done_confirm_email");
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
  const { playerId, icon } = guest?.identity ?? session.identityNamed(name);
  session.accounts.delete(guest?.identity.name ?? name);
  session.accounts.set(name, {
    identity: { playerId, name, icon },
    lastUsedMs: guest?.lastUsedMs ?? session.now,
    registration: registrationOf(session, step),
    usernameChangesMs: guest?.usernameChangesMs ?? [],
    iconChangesMs: guest?.iconChangesMs ?? [],
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
  const email = textOf(step["email"]);
  const problem: ReasonCode | null = await signupProblem(
    { name, email, password: textOf(step["password"]) },
    {
      isHuman: () => Promise.resolve(step["human_check"] === "passed"),
      isTaken: (wanted) => Promise.resolve(isTakenByOther(session, wanted, guest)),
    },
  );
  session.rejected =
    problem ?? lobbyEmailRejection(session, guest?.identity.playerId ?? null, email);
  if (session.rejected !== null) {
    return;
  }
  const isElsewhere = accountConfirmingEmail(session, email) !== null;
  saveSignup(session, { name, guest }, step);
  sendSignupEmail(session, name, email, isElsewhere);
  if ("visitor" in by) {
    session.visitorLogins.set(by.visitor, name);
  }
}
