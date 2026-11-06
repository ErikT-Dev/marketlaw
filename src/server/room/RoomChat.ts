import type { ChatLine } from "./ChatLine";
import type { ChatMute } from "./ChatMute";
import type { ChatReader } from "./ChatReader";

export type RoomChat = {
  readonly readers: ReadonlyArray<ChatReader>;
  readonly lines: ReadonlyArray<ChatLine>;
  readonly lineCount: number;
  readonly mutes: ReadonlyArray<ChatMute>;
};
