import { chatDeliveriesBetween } from "../../../src/server/room/chatDeliveriesBetween.ts";
import type { ChatContext } from "../../../src/server/room/ChatContext.ts";
import type { ChatMessage } from "../../../src/server/room/ChatMessage.ts";
import type { ChatQuota } from "../../../src/server/room/ChatQuota.ts";
import { NO_CHAT_QUOTA } from "../../../src/server/room/NO_CHAT_QUOTA.ts";
import type { ChatStorage } from "../../../src/server/room/ChatStorage.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import type { ServerMessage } from "../../../src/shared/protocol/ServerMessage.ts";
import type { MessageOutcome } from "../../../src/server/room/MessageOutcome.ts";
import { isRecord } from "../../harness-check/isRecord.ts";

const CHAT_INTENTS: ReadonlyArray<unknown> = ["send_chat", "mute", "unmute"];

function isChatIntent(message: Readonly<Record<string, unknown>>): boolean {
  const action = message["action"];
  return message["type"] === "room" && isRecord(action) && CHAT_INTENTS.includes(action["type"]);
}

export class LobbyChat {
  private saved: ReadonlyArray<ChatMessage> | null;
  private quota: ChatQuota = NO_CHAT_QUOTA;
  isSavedBeforeShown = true;
  readonly notified = new Set<string>();
  rowsWritten = 0;
  readonly rowsPerChatIntent: number[] = [];
  private chatIntentRowsFrom: number | null = null;

  readonly storage: ChatStorage = {
    messages: () => this.saved ?? [],
    quota: () => this.quota,
    append: ({ message, quota }) => {
      this.saved = [...(this.saved ?? []), message];
      this.quota = quota;
      this.rowsWritten += 1;
    },
  };

  constructor(given: ReadonlyArray<ChatMessage>) {
    this.saved = given;
  }

  contextFor(grantQuota: ChatContext["grantQuota"]): ChatContext {
    return { messages: this.storage.messages(), quota: this.quota, grantQuota };
  }

  isDeleted(): boolean {
    return this.saved === null;
  }

  removeAll(): void {
    this.saved = null;
  }

  beginMessage(message: Readonly<Record<string, unknown>>): void {
    this.chatIntentRowsFrom = isChatIntent(message) ? this.rowsWritten : null;
  }

  receive(
    messagesTo: Map<string, ServerMessage[]>,
    outcome: Pick<MessageOutcome, "chatMessage" | "reply">,
    change: {
      readonly before: { readonly record: RoomRecord | null; readonly messageCount: number };
      readonly after: RoomRecord | null;
    },
  ): void {
    const { chatMessage } = outcome;
    if (chatMessage !== null) {
      this.storage.append(chatMessage);
    }
    if (this.chatIntentRowsFrom !== null && outcome.reply.type === "update") {
      this.rowsPerChatIntent.push(this.rowsWritten - this.chatIntentRowsFrom);
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
