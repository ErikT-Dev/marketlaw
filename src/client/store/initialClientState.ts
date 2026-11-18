import type { ClientState } from "./ClientState";
import { NO_ROOM_CHAT } from "./NO_ROOM_CHAT";
import type { StoredSession } from "./StoredSession";

export function initialClientState(session: StoredSession | null): ClientState {
  return {
    session,
    connection: "closed",
    update: null,
    tutorial: null,
    chat: NO_ROOM_CHAT,
    pendingActions: [],
    rejectedMove: null,
    notice: null,
    timeOutNotice: null,
    serverClockOffsetMs: 0,
    joinError: null,
    removal: null,
    goneRoomCode: null,
    publicRooms: [],
    playersOnline: [],
    isOutdated: false,
    emailDialog: null,
    queue: null,
    queueNotice: null,
    queueRejection: null,
    tutorialRefusal: null,
  };
}
