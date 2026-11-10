import { afterEach, describe, expect, it, vi } from "vitest";
import { brevoSenderOf } from "./brevoSenderOf";

const API_KEY = "xkeysib-secret-key-1234";
const ENV = { BREVO_API_KEY: API_KEY, EMAIL_FROM: "game.sender@example.com" };
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

describe("brevoSenderOf", () => {
  it("is not used without the Brevo key or the sender address", () => {
    expect(brevoSenderOf({})).toBeNull();
    expect(brevoSenderOf({ EMAIL_FROM: ENV.EMAIL_FROM })).toBeNull();
    expect(brevoSenderOf({ BREVO_API_KEY: API_KEY })).toBeNull();
    expect(brevoSenderOf({ BREVO_API_KEY: "", EMAIL_FROM: ENV.EMAIL_FROM })).toBeNull();
  });

  it("posts the email to Brevo with the key and the sender address", async () => {
    const requests = answerWith(
      Response.json({ messageId: "<message-id@relay.example>" }, { status: 201 }),
    );
    expect(await brevoSenderOf(ENV)?.send(EMAIL)).toBe("sent");
    expect(requests).toHaveLength(1);
    const request = requests[0];
    expect(request?.url).toBe("https://api.brevo.com/v3/smtp/email");
    expect(request?.method).toBe("POST");
    expect(request?.headers.get("api-key")).toBe(API_KEY);
    expect(request?.headers.get("Content-Type")).toBe("application/json");
    expect(await request?.json()).toStrictEqual({
      sender: { name: "MarketLaw", email: ENV.EMAIL_FROM },
      to: [{ email: EMAIL.to }],
      subject: EMAIL.subject,
      textContent: EMAIL.text,
    });
  });

  it("fails and logs only the status when Brevo refuses the email", async () => {
    const lines = loggedLines();
    answerWith(
      Response.json(
        { code: "invalid_parameter", message: `Invalid to: ${EMAIL.to}` },
        { status: 400 },
      ),
    );
    expect(await brevoSenderOf(ENV)?.send(EMAIL)).toBe("failed");
    expectNothingPrivateIn(lines());
    expect(lines().join(" ")).toContain("400");
  });

  it("fails and logs nothing private when Brevo cannot be reached", async () => {
    const lines = loggedLines();
    vi.stubGlobal("fetch", async () =>
      Promise.reject(new Error(`offline while sending to ${EMAIL.to} with ${API_KEY}`)),
    );
    expect(await brevoSenderOf(ENV)?.send(EMAIL)).toBe("failed");
    expectNothingPrivateIn(lines());
  });
});
