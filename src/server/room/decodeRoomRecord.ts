import * as v from "valibot";
import type { RoomRecord } from "./RoomRecord";
import { STORED_ROOM_SCHEMA } from "./STORED_ROOM_SCHEMA";
import { parsedJsonOf } from "./parsedJsonOf";

async function decompressedText(stored: Uint8Array | ArrayBuffer): Promise<string | undefined> {
  try {
    const decompressed = new Blob([new Uint8Array(stored)])
      .stream()
      .pipeThrough(new DecompressionStream("deflate-raw"));
    return await new Response(decompressed).text();
  } catch {
    return undefined;
  }
}

export async function decodeRoomRecord(stored: unknown): Promise<RoomRecord | undefined> {
  if (!(stored instanceof Uint8Array) && !(stored instanceof ArrayBuffer)) {
    return undefined;
  }
  const text = await decompressedText(stored);
  const parsed = v.safeParse(
    STORED_ROOM_SCHEMA,
    text === undefined ? undefined : parsedJsonOf(text),
  );
  return parsed.success ? parsed.output : undefined;
}
