import * as v from "valibot";
import { sha256Hex } from "../sha256Hex";

const TEST_ROOM_ENV = v.object({ TEST_ROOM_SECRET: v.pipe(v.string(), v.minLength(16)) });
export const TEST_ROOM_SECRET_HEADER = "x-test-room-secret";

export async function hasTestRoomSecret(request: Request, env: unknown): Promise<boolean> {
  const configured = v.safeParse(TEST_ROOM_ENV, env);
  const sent = request.headers.get(TEST_ROOM_SECRET_HEADER);
  if (!configured.success || sent === null) {
    return false;
  }
  return (await sha256Hex(sent)) === (await sha256Hex(configured.output.TEST_ROOM_SECRET));
}
