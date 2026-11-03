import { readLocalTestRoomSecret } from "./readLocalTestRoomSecret.ts";

const LOCAL_SITE = "http://localhost:8787";

export function testRoomSecretFor(site: string): string {
  const fromEnvironment = process.env["TEST_ROOM_SECRET"];
  if (fromEnvironment !== undefined) {
    return fromEnvironment;
  }
  if (site !== LOCAL_SITE) {
    throw new Error("set TEST_ROOM_SECRET to the live site's secret");
  }
  return readLocalTestRoomSecret();
}
