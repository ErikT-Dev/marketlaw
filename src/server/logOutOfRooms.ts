import { lobbyOf } from "./lobbyOf";
import type { Sender } from "./Sender";

export async function logOutOfRooms(
  env: Env,
  login: {
    readonly sender: Sender;
    readonly token: string;
    readonly isLeaving: boolean;
    readonly isEndingEveryLogin: boolean;
  },
): Promise<boolean> {
  const { playerId } = login.sender.identity;
  const lobby = lobbyOf(env);
  const busyCode = await lobby.busyRoomOf(playerId);
  const codes = [
    ...(busyCode === null ? [] : [busyCode]),
    ...(await lobby.stayingRoomsOf(playerId)),
  ];
  const leftRooms = await Promise.allSettled(
    [...new Set(codes)].map(async (code) => env.ROOM.get(env.ROOM.idFromName(code)).logOut(login)),
  );
  return leftRooms.every(({ status }) => status === "fulfilled");
}
