import { RANKED_QUEUE_PLACE } from "./lobby/RANKED_QUEUE_PLACE";
import { lobbyOf } from "./lobbyOf";
import { queueOf } from "./queueOf";
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
  const busyPlace = await lobby.busyPlaceOf(playerId);
  const codes = [
    ...(busyPlace === null || busyPlace === RANKED_QUEUE_PLACE ? [] : [busyPlace]),
    ...(await lobby.stayingRoomsOf(playerId)),
  ];
  const leftRooms = await Promise.allSettled([
    ...[...new Set(codes)].map(async (code) =>
      env.ROOM.get(env.ROOM.idFromName(code)).logOut(login),
    ),
    queueOf(env).logOut(login),
  ]);
  return leftRooms.every(({ status }) => status === "fulfilled");
}
