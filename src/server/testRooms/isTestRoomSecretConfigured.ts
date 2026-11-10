import * as v from "valibot";

const TEST_ROOM_ENV = v.object({ TEST_ROOM_SECRET: v.pipe(v.string(), v.minLength(16)) });

export function isTestRoomSecretConfigured(env: unknown): boolean {
  return v.is(TEST_ROOM_ENV, env);
}
