import { describe, expect, it } from "vitest";
import { hasTestRoomSecret, TEST_ROOM_SECRET_HEADER } from "./hasTestRoomSecret";

const SECRET = "a-test-room-secret-of-enough-length";

function requestWith(secret: string | null): Request {
  const headers: Record<string, string> =
    secret === null ? {} : { [TEST_ROOM_SECRET_HEADER]: secret };
  return new Request("https://example.test/api/test-rooms", { method: "POST", headers });
}

describe("test room secret", () => {
  it("refuses every request when no secret is configured", async () => {
    expect(await hasTestRoomSecret(requestWith(SECRET), {})).toBe(false);
  });

  it("refuses a configured secret that is too short to be safe", async () => {
    expect(await hasTestRoomSecret(requestWith("short"), { TEST_ROOM_SECRET: "short" })).toBe(
      false,
    );
  });

  it("refuses a request without the secret or with a wrong one", async () => {
    const env = { TEST_ROOM_SECRET: SECRET };
    expect(await hasTestRoomSecret(requestWith(null), env)).toBe(false);
    expect(await hasTestRoomSecret(requestWith(`${SECRET}x`), env)).toBe(false);
  });

  it("accepts a request with the configured secret", async () => {
    expect(await hasTestRoomSecret(requestWith(SECRET), { TEST_ROOM_SECRET: SECRET })).toBe(true);
  });
});
