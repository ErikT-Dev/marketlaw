import type { PlayerId } from "../../shared/PlayerId";
import type { Result } from "../../shared/Result";
import type { ChatIntent } from "./ChatIntent";
import type { RoomChat } from "./RoomChat";
import type { RoomRecord } from "./RoomRecord";

type MuteIntent = Extract<ChatIntent, { readonly type: "mute" | "unmute" }>;

function chatAfterUnmute(chat: RoomChat, by: PlayerId, mutedName: string): RoomChat {
  const mutes = chat.mutes.filter((mute) => mute.by !== by || mute.mutedName !== mutedName);
  return mutes.length === chat.mutes.length ? chat : { ...chat, mutes };
}

export function chatAfterMute(
  record: RoomRecord,
  by: PlayerId,
  intent: MuteIntent,
): Result<RoomChat, "player_not_in_room"> {
  const { chat } = record;
  if (intent.type === "unmute") {
    return { isOk: true, value: chatAfterUnmute(chat, by, intent.playerName) };
  }
  const target = record.players.find(
    (player) => player.name === intent.playerName && player.playerId !== by,
  );
  if (target === undefined) {
    return { isOk: false, error: "player_not_in_room" };
  }
  if (chat.mutes.some((mute) => mute.by === by && mute.muted === target.playerId)) {
    return { isOk: true, value: chat };
  }
  const mute = { by, muted: target.playerId, mutedName: target.name };
  return { isOk: true, value: { ...chat, mutes: [...chat.mutes, mute] } };
}
