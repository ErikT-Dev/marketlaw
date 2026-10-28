import { readFileSync } from "node:fs";

const SECRET_LINE = "TEST_ROOM_SECRET=";

export function readLocalTestRoomSecret(): string {
  const line = readFileSync(".dev.vars", "utf8")
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(SECRET_LINE));
  return line?.slice(SECRET_LINE.length) ?? "";
}
