import * as v from "valibot";
import type { RoomRecord } from "./RoomRecord";
import { STORED_ROOM_SCHEMA } from "./STORED_ROOM_SCHEMA";

export async function decodeRoomRecord(stored: unknown): Promise<RoomRecord | undefined> {
  if (!(stored instanceof Uint8Array) && !(stored instanceof ArrayBuffer)) {
    return undefined;
  }
  const decompressed = new Blob([new Uint8Array(stored)])
    .stream()
    .pipeThrough(new DecompressionStream("deflate-raw"));
  const parsed = v.safeParse(
    STORED_ROOM_SCHEMA,
    JSON.parse(await new Response(decompressed).text()),
  );
  return parsed.success ? parsed.output : undefined;
}
