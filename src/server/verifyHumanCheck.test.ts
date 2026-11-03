import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyHumanCheck } from "./verifyHumanCheck";

const KEYS = { TURNSTILE_SITE_KEY: "site", TURNSTILE_SECRET_KEY: "secret" };
const REQUEST = new Request("https://example.com/api/guests", { method: "POST" });

function answerWith(body: unknown) {
  const fetchMock = vi.fn(async () => Promise.resolve(Response.json(body)));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("verifyHumanCheck", () => {
  it("passes when Turnstile says the check succeeded", async () => {
    const fetchMock = answerWith({ success: true });
    expect(await verifyHumanCheck(KEYS, REQUEST, "token")).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("fails when Turnstile says the check failed", async () => {
    answerWith({ success: false, "error-codes": ["invalid-input-response"] });
    expect(await verifyHumanCheck(KEYS, REQUEST, "token")).toBe(false);
  });

  it("fails without asking Turnstile when the token is empty or the keys are missing", async () => {
    const fetchMock = answerWith({ success: true });
    expect(await verifyHumanCheck(KEYS, REQUEST, "")).toBe(false);
    expect(await verifyHumanCheck({}, REQUEST, "token")).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails when Turnstile cannot be reached or answers nonsense", async () => {
    vi.stubGlobal("fetch", async () => Promise.reject(new Error("offline")));
    expect(await verifyHumanCheck(KEYS, REQUEST, "token")).toBe(false);
    answerWith("not json");
    expect(await verifyHumanCheck(KEYS, REQUEST, "token")).toBe(false);
  });
});
