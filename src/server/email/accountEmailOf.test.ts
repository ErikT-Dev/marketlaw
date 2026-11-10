import { describe, expect, it } from "vitest";
import { accountEmailOf } from "./accountEmailOf";
import { emailLimitRejection } from "./emailLimitRejection";

const SITE = "https://marketlaw.example";
const TOKEN = "a1b2c3";

describe("account emails", () => {
  it("sends a confirmation link that works for 24 hours", () => {
    const email = accountEmailOf({ kind: "confirm", to: "ann@example.com", token: TOKEN }, SITE);
    expect(email.to).toBe("ann@example.com");
    expect(email.subject).toBe("MarketLaw: Confirm your email address");
    expect(email.text).toContain(`${SITE}/#confirm=${TOKEN}`);
    expect(email.text).toContain("24 hours");
    expect(email.text).toContain("If this was not you, ignore this email.");
  });

  it("sends a reset link that works for 1 hour", () => {
    const email = accountEmailOf({ kind: "reset", to: "ann@example.com", token: TOKEN }, SITE);
    expect(email.text).toContain(`${SITE}/#reset=${TOKEN}`);
    expect(email.text).toContain("1 hour");
  });

  it("confirms a new address with the same kind of link", () => {
    const email = accountEmailOf(
      { kind: "change_confirm", to: "new@example.com", token: TOKEN },
      SITE,
    );
    expect(email.subject).toBe("MarketLaw: Confirm your new email address");
    expect(email.text).toContain(`${SITE}/#confirm=${TOKEN}`);
  });

  it("says an address is already in use and points to the forgotten password link", () => {
    const email = accountEmailOf({ kind: "already_in_use", to: "bea@example.com" }, SITE);
    expect(email.text).toContain("already belongs to an account");
    expect(email.text).toContain(`${SITE}/#forgot-password`);
    expect(email.text).not.toContain("#confirm=");
  });
});

describe("email limits", () => {
  it("allows 3 emails a day for each account and each address", () => {
    expect(emailLimitRejection({ account: 2, address: 2 })).toBeNull();
    expect(emailLimitRejection({ account: 3, address: 0 })).toBe("email_limit_reached");
    expect(emailLimitRejection({ account: 0, address: 3 })).toBe("email_limit_reached");
  });
});
