import type { PlayerId } from "../shared/PlayerId";
import type { ClientMessage } from "../shared/protocol/ClientMessage";
import { guestLogOutIntentIn } from "./room/guestLogOutIntentIn";
import { guestLogOutMessageOf } from "./room/guestLogOutMessageOf";
import { loadRoom } from "./room/loadRoom";
import type { RoomStorage } from "./room/RoomStorage";

const GUEST_LOG_OUT_STEPS = 2;

export async function leaveAsLoggedOutGuest(
  room: {
    readonly storage: RoomStorage;
    readonly receive: (message: ClientMessage) => Promise<void>;
  },
  login: { readonly playerId: PlayerId; readonly token: string },
  stepsLeft: number = GUEST_LOG_OUT_STEPS,
): Promise<void> {
  const intent = guestLogOutIntentIn(loadRoom(room.storage), login.playerId);
  if (intent === null || stepsLeft === 0) {
    return;
  }
  const actionId = crypto.randomUUID();
  await room.receive(guestLogOutMessageOf(intent, { token: login.token, actionId }));
  await leaveAsLoggedOutGuest(room, login, stepsLeft - 1);
}
