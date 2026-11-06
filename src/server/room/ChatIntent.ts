import type { RoomIntent } from "../../shared/protocol/RoomIntent";

export type ChatIntent = Extract<RoomIntent, { readonly type: "send_chat" | "mute" | "unmute" }>;
