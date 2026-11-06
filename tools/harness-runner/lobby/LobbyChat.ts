import { chatDeliveriesBetween } from "../../../src/server/room/chatDeliveriesBetween.ts";
import type { ChatMessage } from "../../../src/server/room/ChatMessage.ts";
import type { ChatStorage } from "../../../src/server/room/ChatStorage.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import type { ServerMessage } from "../../../src/shared/protocol/ServerMessage.ts";

export class LobbyChat {
  private saved: ReadonlyArray<ChatMessage> | null;
  isSavedBeforeShown = true;
  readonly notified = new Set<string>();

  readonly storage: ChatStorage = {
    messages: () => this.saved ?? [],
    append: (message) => {
      this.saved = [...(this.saved ?? []), message];
    },
  };

  constructor(given: ReadonlyArray<ChatMessage>) {
    this.saved = given;
  }

  isDeleted(): boolean {
    return this.saved === null;
  }

  removeAll(): void {
    this.saved = null;
  }

  receive(
    messagesTo: Map<string, ServerMessage[]>,
    chatMessage: ChatMessage | null,
    change: {
      readonly before: { readonly record: RoomRecord | null; readonly messageCount: number };
      readonly after: RoomRecord | null;
    },
  ): void {
    if (chatMessage !== null) {
      this.storage.append(chatMessage);
    }
    const deliveries = chatDeliveriesBetween(change.before, change.after, this.storage.messages());
    const known = change.after?.players ?? [];
    for (const { playerId, message } of deliveries) {
      const name = known.find((player) => player.playerId === playerId)?.name ?? playerId;
      const shown = message.entries.flatMap((entry) => (entry.kind === "message" ? [entry] : []));
      const isAllSaved = shown.every((entry) =>
        this.storage.messages().some((saved) => saved.text === entry.text && saved.at === entry.at),
      );
      this.isSavedBeforeShown = this.isSavedBeforeShown && isAllSaved;
      if (shown.some((entry) => !entry.isOwn)) {
        this.notified.add(name);
      }
      messagesTo.set(name, [...(messagesTo.get(name) ?? []), message]);
    }
  }
}
