import * as v from "valibot";
import { PlayerId } from "../PlayerId";
import { RoomCode } from "../RoomCode";
import { PlayerOnlineView } from "./PlayerOnlineView";

export const LobbyMessage = v.object({
  type: v.literal("lobby"),
  protocolVersion: v.number(),
  publicRooms: v.array(
    v.object({
      code: RoomCode,
      size: v.number(),
      ownerName: v.string(),
      playerNames: v.array(v.string()),
      playerIds: v.array(PlayerId),
    }),
  ),
  playersOnline: v.array(PlayerOnlineView),
});

export type LobbyMessage = v.InferOutput<typeof LobbyMessage>;
