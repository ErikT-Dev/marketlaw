import { TutorialSession } from "../tutorial/TutorialSession.ts";
import type { LobbySession } from "./LobbySession.ts";

export function lobbyTutorialSession(session: LobbySession): TutorialSession {
  return new TutorialSession({
    identityNamed: (name) => session.identityNamed(name),
    lobby: {
      read: () => session.lobby,
      write: (lobby) => {
        session.lobby = lobby;
      },
    },
  });
}
