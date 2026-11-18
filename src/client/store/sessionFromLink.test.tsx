import { describe, expect, it } from "vitest";
import { sessionFromLink } from "./sessionFromLink";

describe("sessionFromLink", () => {
  it("reads a seat link from a test room", () => {
    expect(sessionFromLink("#session=abc123&name=Ann&room=K7QR2P")).toEqual({
      token: "abc123",
      playerId: null,
      name: "Ann",
      isGuest: true,
      roomCode: "K7QR2P",
      isInTutorial: false,
    });
  });

  it("ignores an address without a complete seat link", () => {
    expect(sessionFromLink("")).toBeNull();
    expect(sessionFromLink("#session=abc123&name=Ann")).toBeNull();
    expect(sessionFromLink("#session=abc123&name=Ann&room=bad")).toBeNull();
  });
});
