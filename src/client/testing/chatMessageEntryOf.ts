import * as v from "valibot";
import { EpochMs } from "../../shared/EpochMs";
import type { ChatMessageEntry } from "../../shared/protocol/ChatMessageEntry";
import { testPlayerIdOf } from "./testPlayerIdOf";

export function chatMessageEntryOf(from: string, isOwn = false): ChatMessageEntry {
  return {
    kind: "message",
    from,
    fromId: testPlayerIdOf(from.length),
    text: "Hi",
    at: v.parse(EpochMs, 7000),
    isOwn,
  };
}
