import { newRoomCode } from "../../../src/server/newRoomCode.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";

export function withInGameRooms(given: LobbyGiven): LobbyGiven {
  const inGame = (given.accounts ?? []).filter((account) => account.in_game === true);
  if (inGame.length === 0) {
    return given;
  }
  const rooms = inGame.map(({ name }) => ({
    code: newRoomCode(),
    size: 2 as const,
    public: false,
    players: [name, `Opponent of ${name}`],
    state: "playing" as const,
  }));
  return { ...given, other_rooms: [...(given.other_rooms ?? []), ...rooms] };
}
