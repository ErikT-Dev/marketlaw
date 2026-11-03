import { TEST_ROOM_SECRET_HEADER } from "../../src/shared/api/TEST_ROOM_SECRET_HEADER.ts";
import { testRoomSecretFor } from "../test-room/testRoomSecretFor.ts";

export async function exportReplay(code: string, site: string): Promise<string> {
  const response = await fetch(`${site}/api/rooms/${encodeURIComponent(code)}/replay`, {
    headers: { [TEST_ROOM_SECRET_HEADER]: testRoomSecretFor(site) },
  });
  if (!response.ok) {
    throw new Error(
      `no replay for room ${code}: the room and its record are gone, or the secret is wrong`,
    );
  }
  return response.text();
}
