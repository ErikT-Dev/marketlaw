import type { PlayerId } from "../../shared/PlayerId";
import type { RoomChat } from "./RoomChat";

export function mutedNamesOf(chat: RoomChat, playerId: PlayerId): ReadonlyArray<string> {
  return chat.mutes.filter((mute) => mute.by === playerId).map((mute) => mute.mutedName);
}
