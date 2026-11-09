import { guestLogOutIntentIn } from "../../../src/server/room/guestLogOutIntentIn.ts";
import { guestLogOutMessageOf } from "../../../src/server/room/guestLogOutMessageOf.ts";
import { roomTokenOf } from "./roomTokenOf.ts";
import type { RoomSession } from "./RoomSession.ts";

const GUEST_LOG_OUT_STEPS = 2;

async function leaveAsGuest(session: RoomSession, name: string, stepsLeft: number) {
  const intent = guestLogOutIntentIn(session.record, session.identityNamed(name).playerId);
  if (intent === null || stepsLeft === 0) {
    return;
  }
  const message = guestLogOutMessageOf(intent, {
    token: roomTokenOf(name),
    actionId: `log-out-${String(stepsLeft)}`,
  });
  await session.sendRaw({ player: name, text: JSON.stringify(message) });
  await leaveAsGuest(session, name, stepsLeft - 1);
}

export async function logOutInRoom(
  session: RoomSession,
  name: string,
  isRegistered: boolean,
): Promise<void> {
  if (!isRegistered) {
    await leaveAsGuest(session, name, GUEST_LOG_OUT_STEPS);
  }
  session.offline.add(name);
  const connection = session.connections.get(name);
  session.connections.set(name, {
    state: connection?.state ?? { identity: null, rejectionTimes: [] },
    isClosed: true,
  });
}
