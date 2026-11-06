import * as v from "valibot";

const CHAT_TEXT_PARSE_LIMIT = 4000;
const PLAYER_NAME_PARSE_LIMIT = 100;
const PLAYER_NAME = v.pipe(v.string(), v.maxLength(PLAYER_NAME_PARSE_LIMIT));

export const RoomIntent = v.variant("type", [
  v.strictObject({ type: v.literal("change_size"), size: v.picklist([2, 3, 4]) }),
  v.strictObject({ type: v.literal("leave_room") }),
  v.strictObject({ type: v.literal("accept_game") }),
  v.strictObject({ type: v.literal("decline_game") }),
  v.strictObject({
    type: v.literal("send_chat"),
    text: v.pipe(v.string(), v.maxLength(CHAT_TEXT_PARSE_LIMIT)),
  }),
  v.strictObject({ type: v.literal("mute"), playerName: PLAYER_NAME }),
  v.strictObject({ type: v.literal("unmute"), playerName: PLAYER_NAME }),
]);

export type RoomIntent = v.InferOutput<typeof RoomIntent>;
