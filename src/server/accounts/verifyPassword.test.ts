import { describe, expect, it } from "vitest";
import { hashPassword } from "./hashPassword";
import { verifyPassword } from "./verifyPassword";

const SALT = new Uint8Array(16).fill(7);

describe("hashPassword and verifyPassword", () => {
  it("stores the method, the iteration count, the salt and the hash", async () => {
    const stored = await hashPassword("correct horse", SALT);
    const [method, iterations, salt, hash] = stored.split("$");
    expect(method).toBe("pbkdf2-sha256");
    expect(iterations).toBe("20000");
    expect(salt).toBe(btoa(String.fromCharCode(...SALT)));
    expect(atob(hash ?? "")).toHaveLength(32);
  });

  it("uses a new random salt for every password", async () => {
    expect(await hashPassword("correct horse")).not.toBe(await hashPassword("correct horse"));
  });

  it("accepts the right password and rejects a wrong one", async () => {
    const stored = await hashPassword("correct horse");
    expect(await verifyPassword("correct horse", stored)).toBe(true);
    expect(await verifyPassword("correct horsf", stored)).toBe(false);
    expect(await verifyPassword("", stored)).toBe(false);
  });

  it("reads the iteration count from the stored hash", async () => {
    const stored = await hashPassword("correct horse", SALT);
    const withFewerIterations = stored.replace("$20000$", "$1000$");
    expect(await verifyPassword("correct horse", withFewerIterations)).toBe(false);
  });

  it("rejects every password for an unknown account", async () => {
    expect(await verifyPassword("correct horse", null)).toBe(false);
    expect(await verifyPassword("", null)).toBe(false);
  });

  it("throws on a stored hash in an unknown format", async () => {
    await expect(verifyPassword("correct horse", "plain$text")).rejects.toThrow();
    await expect(
      verifyPassword("correct horse", "pbkdf2-sha256$2000000$AA==$AA=="),
    ).rejects.toThrow();
  });
});
