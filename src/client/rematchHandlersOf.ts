import type { ClientStore } from "./store/ClientStore";

export function rematchHandlersOf(store: ClientStore): {
  readonly onAskRematch: () => void;
  readonly onAccept: () => void;
  readonly onDecline: () => void;
} {
  return {
    onAskRematch: () => {
      store.sendRoomAction({ type: "ask_rematch" });
    },
    onAccept: () => {
      store.sendRoomAction({ type: "accept_game" });
    },
    onDecline: () => {
      store.sendRoomAction({ type: "decline_game" });
    },
  };
}
