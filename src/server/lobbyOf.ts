import type { Lobby } from "./Lobby";

const LOBBY_NAME = "lobby";

export function lobbyOf(env: Env): DurableObjectStub<Lobby> {
  return env.LOBBY.get(env.LOBBY.idFromName(LOBBY_NAME));
}
