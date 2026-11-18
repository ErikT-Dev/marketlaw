import type { TutorialStepId } from "../../../src/shared/TutorialStepId.ts";
import { playTutorialUntil } from "../tutorial/playTutorialUntil.ts";
import type { LobbySession } from "./LobbySession.ts";

export function startTutorialInLobby(session: LobbySession, name: string): void {
  const { tutorial } = session;
  tutorial.now = session.now;
  session.rejected = tutorial.start(name);
  const reply = tutorial.lastReply;
  if (session.rejected === null) {
    session.leaveFinishedRoom(session.identityNamed(name).playerId);
  } else if (reply !== null) {
    session.messagesTo.set(name, [...(session.messagesTo.get(name) ?? []), reply]);
  }
}

export function givenTutorialInLobby(
  session: LobbySession,
  given: { readonly player: string; readonly step: TutorialStepId } | undefined,
): void {
  if (given !== undefined) {
    session.tutorial.now = session.now;
    playTutorialUntil(session.tutorial, given.player, given.step);
  }
}

export function waitInLobbyTutorial(session: LobbySession, ms: number): void {
  session.tutorial.now = session.now;
  session.tutorial.wait(ms);
}

export function disconnectFromLobbyTutorial(session: LobbySession, name: string): void {
  if (session.tutorial.record?.player.name === name) {
    session.tutorial.disconnect();
  }
}
