import { guestLogOutIntentIn } from "../../../src/server/room/guestLogOutIntentIn.ts";
import type { LobbySession } from "./LobbySession.ts";

const GUEST_LOG_OUT_STEPS = 2;

function leaveAsGuest(session: LobbySession, name: string, stepsLeft: number): void {
  const intent = guestLogOutIntentIn(session.record, session.identityNamed(name).playerId);
  if (intent === null || stepsLeft === 0) {
    return;
  }
  if (intent.type === "action") {
    session.sendGameAction(name, intent.action);
  } else {
    session.sendRoomAction(name, intent.action);
  }
  leaveAsGuest(session, name, stepsLeft - 1);
}

export function logOutPlayer(
  session: LobbySession,
  name: string,
  isLeaving: boolean = session.accounts.get(name)?.registration === null,
): void {
  if (isLeaving) {
    leaveAsGuest(session, name, GUEST_LOG_OUT_STEPS);
  }
  if (session.loggedIn?.["as"] === name) {
    session.loggedIn = null;
  }
  session.setConnected(name, false);
}
