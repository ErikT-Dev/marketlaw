import * as v from "valibot";
import { TEST_ROOM_SECRET_HEADER } from "../../shared/api/TEST_ROOM_SECRET_HEADER";
import { sha256Hex } from "../sha256Hex";

const TEST_ROOM_ENV = v.object({ TEST_ROOM_SECRET: v.pipe(v.string(), v.minLength(16)) });

export async function hasTestRoomSecret(request: Request, env: unknown): Promise<boolean> {
  const configured = v.safeParse(TEST_ROOM_ENV, env);
  const sent = request.headers.get(TEST_ROOM_SECRET_HEADER);
  if (!configured.success || sent === null) {
    return false;
  }
  return (await sha256Hex(sent)) === (await sha256Hex(configured.output.TEST_ROOM_SECRET));
}
