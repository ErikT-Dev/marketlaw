import type { ChatBinding } from "./screens/chat/ChatBinding";
import type { ClientStore } from "./store/ClientStore";
import type { RoomChat } from "./store/RoomChat";

export function chatBindingOf(store: ClientStore, chat: RoomChat): ChatBinding {
  return {
    chat,
    onSend: (text) => {
      store.sendRoomAction({ type: "send_chat", text });
    },
    onMute: (playerName) => {
      store.sendRoomAction({ type: "mute", playerName });
    },
    onSeen: store.markChatRead,
  };
}
