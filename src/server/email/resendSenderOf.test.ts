import { afterEach, describe, expect, it, vi } from "vitest";
import { resendSenderOf } from "./resendSenderOf";

const API_KEY = "re_secret_key_1234";
const ENV = { RESEND_API_KEY: API_KEY, EMAIL_FROM: "MarketLaw <noreply@example.com>" };
const LINK = "https://marketlaw.example/#confirm=link-token-5678";
const EMAIL = {
  to: "player@example.org",
  subject: "Confirm your email address",
  text: `Open this link: ${LINK}`,
};

function answerWith(response: Response) {
  const requests: Request[] = [];
  vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
    requests.push(new Request(url, init));
    return Promise.resolve(response);
  });
  return requests;
}

function loggedLines() {
  const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
  const plainLog = vi.spyOn(console, "log").mockImplementation(() => undefined);
  const warnLog = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  return () =>
    [errorLog, plainLog, warnLog].flatMap((spy) =>
      spy.mock.calls.map((call) => call.map(String).join(" ")),
    );
}

function expectNothingPrivateIn(lines: readonly string[]) {
  expect(lines.length).toBeGreaterThan(0);
  for (const line of lines) {
    expect(line).not.toContain("@");
    expect(line).not.toContain(API_KEY);
    expect(line).not.toContain("link-token-5678");
    expect(line).not.toContain("https://");
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("resendSenderOf", () => {
  it("is not used without the Resend key or the sender address", () => {
    expect(resendSenderOf({})).toBeNull();
    expect(resendSenderOf({ EMAIL_FROM: ENV.EMAIL_FROM })).toBeNull();
    expect(resendSenderOf({ RESEND_API_KEY: API_KEY })).toBeNull();
    expect(resendSenderOf({ RESEND_API_KEY: "", EMAIL_FROM: ENV.EMAIL_FROM })).toBeNull();
  });

  it("posts the email to Resend with the key and the sender address", async () => {
    const requests = answerWith(Response.json({ id: "email-id" }));
    expect(await resendSenderOf(ENV)?.send(EMAIL)).toBe("sent");
    expect(requests).toHaveLength(1);
    const request = requests[0];
    expect(request?.url).toBe("https://api.resend.com/emails");
    expect(request?.method).toBe("POST");
    expect(request?.headers.get("Authorization")).toBe(`Bearer ${API_KEY}`);
    expect(request?.headers.get("Content-Type")).toBe("application/json");
    expect(await request?.json()).toStrictEqual({
      from: ENV.EMAIL_FROM,
      to: EMAIL.to,
      subject: EMAIL.subject,
      text: EMAIL.text,
    });
  });

  it("fails and logs only the status when Resend refuses the email", async () => {
    const lines = loggedLines();
    answerWith(Response.json({ message: `Invalid to: ${EMAIL.to}` }, { status: 422 }));
    expect(await resendSenderOf(ENV)?.send(EMAIL)).toBe("failed");
    expectNothingPrivateIn(lines());
    expect(lines().join(" ")).toContain("422");
  });

  it("fails and logs nothing private when Resend cannot be reached", async () => {
    const lines = loggedLines();
    vi.stubGlobal("fetch", async () =>
      Promise.reject(new Error(`offline while sending to ${EMAIL.to} with ${API_KEY}`)),
    );
    expect(await resendSenderOf(ENV)?.send(EMAIL)).toBe("failed");
    expectNothingPrivateIn(lines());
  });
});
