import type { RoomChat } from "../../store/RoomChat";

export type ChatBinding = {
  readonly chat: RoomChat;
  readonly onSend: (text: string) => void;
  readonly onMute: (playerName: string) => void;
  readonly onSeen: () => void;
};
