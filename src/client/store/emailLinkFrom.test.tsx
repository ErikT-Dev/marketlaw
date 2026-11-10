import { describe, expect, it } from "vitest";
import { emailLinkFrom } from "./emailLinkFrom";

describe("emailLinkFrom", () => {
  it("reads confirmation, reset and forgotten password links", () => {
    expect(emailLinkFrom("#confirm=abc123")).toEqual({ kind: "confirm", link: "abc123" });
    expect(emailLinkFrom("#reset=def456")).toEqual({ kind: "reset", link: "def456" });
    expect(emailLinkFrom("#forgot-password")).toEqual({ kind: "forgot_password" });
  });

  it("ignores an address that is not an email link", () => {
    expect(emailLinkFrom("")).toBeNull();
    expect(emailLinkFrom("#confirm=")).toBeNull();
    expect(emailLinkFrom("#confirm=abc&reset=def")).toBeNull();
    expect(emailLinkFrom("#session=abc123&name=Ann&room=K7QR2P")).toBeNull();
  });
});
