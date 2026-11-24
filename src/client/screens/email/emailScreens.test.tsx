import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { TEST_PLAYER_ICON } from "../../../shared/testing/TEST_PLAYER_ICON";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameHost } from "../../../shared/GameHost";
import { App } from "../../App";
import { ClientStore } from "../../store/ClientStore";
import { readSession } from "../../store/readSession";
import { writeSession } from "../../store/writeSession";

type SentRequest = { readonly path: string; readonly body: unknown };
type Answers = Readonly<
  Record<string, ReadonlyArray<{ readonly status: number; readonly body: unknown }>>
>;

const OK = { status: 200, body: { isOk: true } };
const LINK_EXPIRED = { status: 400, body: { isOk: false, reason: "link_expired" } };
const BEA = {
  isOk: true,
  token: "bea-token",
  playerId: "7d0c7f1e-4b7a-4c5e-9a39-2f4d9c1b8e10",
  name: "Bea",
  icon: TEST_PLAYER_ICON,
};

function idleHost(): GameHost {
  return {
    sendAction: () => null,
    sendRoomAction: () => false,
    sendTutorialAction: () => null,
    requestResync: () => undefined,
    subscribe: () => () => undefined,
    close: () => undefined,
  };
}

function serverAnswers(answers: Answers): ReadonlyArray<SentRequest> {
  const sent: SentRequest[] = [];
  vi.stubGlobal("fetch", async (path: string, init?: { readonly body?: string }) => {
    if (path === "/api/human-check") {
      return Promise.resolve(Response.json({ siteKey: "key" }));
    }
    const body: unknown = init?.body === undefined ? null : JSON.parse(init.body);
    const earlier = sent.filter((request) => request.path === path).length;
    sent.push({ path, body });
    const answer = answers[path]?.[earlier] ?? { status: 200, body: {} };
    return Promise.resolve(Response.json(answer.body, { status: answer.status }));
  });
  return sent;
}

function openApp(): ClientStore {
  const store = new ClientStore(() => idleHost());
  render(<App store={store} />);
  return store;
}

function type(container: HTMLElement, label: string, value: string): void {
  fireEvent.change(within(container).getByLabelText(label), { target: { value } });
}

function logInAsBea(): void {
  writeSession({
    token: "bea-token",
    playerId: null,
    name: "Bea",
    isGuest: false,
    roomCode: null,
    isInTutorial: false,
  });
}

beforeEach(() => {
  localStorage.clear();
  Reflect.set(window, "turnstile", {
    render: (container: unknown, options: { readonly callback: (token: string) => void }) => {
      options.callback("passed");
      return "widget";
    },
    remove: () => undefined,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window, "turnstile");
});

describe("check your email", () => {
  it("asks to confirm the address after signing up and sends the link again", async () => {
    const limit = { status: 429, body: { isOk: false, reason: "email_limit_reached" } };
    const sent = serverAnswers({
      "/api/signups": [{ status: 200, body: BEA }],
      "/api/confirmation-emails": [OK, limit],
    });
    const store = openApp();
    const signup = { username: "Bea", email: "bea@example.com", password: "long enough" };
    await act(async () => store.signUp({ ...signup, humanCheck: "passed" }));
    const dialog = screen.getByRole("dialog", { name: "Check your email" });
    expect(dialog.textContent).toContain("We sent a link to bea@example.com.");
    expect(dialog.textContent).toContain("Check your spam folder");
    fireEvent.click(within(dialog).getByRole("button", { name: "Send it again" }));
    expect(await within(dialog).findByText("We sent the link again.")).toBeDefined();
    expect(sent.at(-1)).toEqual({ path: "/api/confirmation-emails", body: { token: "bea-token" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Send it again" }));
    expect(await within(dialog).findByText(/No more emails can be sent/)).toBeDefined();
    fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
    expect(screen.queryByRole("dialog", { name: "Check your email" })).toBeNull();
  });
});

describe("email links", () => {
  it("confirms an email address from its link", async () => {
    const sent = serverAnswers({ "/api/email-confirmations": [OK] });
    const store = openApp();
    await act(async () => store.openEmailLink({ kind: "confirm", link: "link-1" }));
    expect(screen.getByRole("dialog", { name: "Email address confirmed" })).toBeDefined();
    expect(sent).toContainEqual({ path: "/api/email-confirmations", body: { link: "link-1" } });
  });

  it("offers to send a new link to a logged-in player whose address is unconfirmed", async () => {
    logInAsBea();
    const email = { address: "bea@example.com", isConfirmed: false, pendingAddress: null };
    const account = {
      isLoggedIn: true,
      name: "Bea",
      usernameWait: null,
      icon: TEST_PLAYER_ICON,
      iconWait: null,
      rating: null,
    };
    const accountBody = { ...account, email: { ...email, wasRemoved: false } };
    serverAnswers({
      "/api/email-confirmations": [LINK_EXPIRED],
      "/api/account": [
        { status: 200, body: accountBody },
        { status: 200, body: accountBody },
      ],
      "/api/confirmation-emails": [OK],
    });
    const store = openApp();
    await act(async () => store.openEmailLink({ kind: "confirm", link: "old-link" }));
    const dialog = screen.getByRole("dialog", { name: "This link no longer works" });
    expect(within(dialog).queryByRole("button", { name: "Forgot password" })).toBeNull();
    fireEvent.click(within(dialog).getByRole("button", { name: "Send it again" }));
    const checkEmail = await screen.findByRole("dialog", { name: "Check your email" });
    expect(checkEmail.textContent).toContain("bea@example.com");
  });

  it("offers the forgotten password form on an expired link to everyone else", async () => {
    serverAnswers({ "/api/email-confirmations": [LINK_EXPIRED] });
    const store = openApp();
    await act(async () => store.openEmailLink({ kind: "confirm", link: "old-link" }));
    const dialog = screen.getByRole("dialog", { name: "This link no longer works" });
    expect(within(dialog).queryByRole("button", { name: "Send it again" })).toBeNull();
    fireEvent.click(within(dialog).getByRole("button", { name: "Forgot password" }));
    expect(screen.getByRole("dialog", { name: "Forgot your password?" })).toBeDefined();
  });

  it("asks for a reset link with the email address and the human check", async () => {
    const notConfirmed = { status: 400, body: { isOk: false, reason: "email_not_confirmed" } };
    const sent = serverAnswers({ "/api/reset-emails": [notConfirmed, OK] });
    const store = openApp();
    await act(async () => store.openEmailLink({ kind: "forgot_password" }));
    const dialog = screen.getByRole("dialog", { name: "Forgot your password?" });
    type(dialog, "Email address", " bea@example.com ");
    const sendLink = within(dialog).getByRole("button", { name: "Send link" });
    await waitFor(() => {
      expect(sendLink).toHaveProperty("disabled", false);
    });
    fireEvent.click(sendLink);
    expect(await within(dialog).findByText(/No account has confirmed/)).toBeDefined();
    await waitFor(() => {
      expect(sendLink).toHaveProperty("disabled", false);
    });
    fireEvent.click(sendLink);
    const checkEmail = await screen.findByRole("dialog", { name: "Check your email" });
    expect(checkEmail.textContent).toContain("We sent a link to bea@example.com.");
    expect(sent.at(-1)).toEqual({
      path: "/api/reset-emails",
      body: { email: "bea@example.com", humanCheck: "passed" },
    });
  });
});

describe("set a new password", () => {
  it("sets the new password from a reset link and logs the browser in", async () => {
    const tooShort = { status: 400, body: { isOk: false, reason: "password_invalid" } };
    const sent = serverAnswers({
      "/api/password-resets": [tooShort, { status: 200, body: BEA }],
    });
    const store = openApp();
    await act(async () => store.openEmailLink({ kind: "reset", link: "reset-1" }));
    const dialog = screen.getByRole("dialog", { name: "Set a new password" });
    type(dialog, "New password", "short");
    type(dialog, "New password again", "shorter");
    fireEvent.click(within(dialog).getByRole("button", { name: "Set password" }));
    expect(within(dialog).getByText("The two passwords are not the same.")).toBeDefined();
    type(dialog, "New password again", "short");
    fireEvent.click(within(dialog).getByRole("button", { name: "Set password" }));
    expect(await within(dialog).findByText(/Use 8 to 64 characters/)).toBeDefined();
    type(dialog, "New password", "long enough");
    type(dialog, "New password again", "long enough");
    fireEvent.click(within(dialog).getByRole("button", { name: "Set password" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Set a new password" })).toBeNull();
    });
    expect(sent.filter(({ path }) => path === "/api/password-resets").at(-1)).toEqual({
      path: "/api/password-resets",
      body: { link: "reset-1", password: "long enough" },
    });
    const session = {
      token: "bea-token",
      playerId: BEA.playerId,
      name: "Bea",
      isGuest: false,
      roomCode: null,
      isInTutorial: false,
    };
    expect(readSession()).toEqual(session);
    expect(screen.getByLabelText("Your account").textContent).toContain("Bea");
  });

  it("shows the link expired screen when the reset link no longer works", async () => {
    serverAnswers({ "/api/password-resets": [LINK_EXPIRED] });
    const store = openApp();
    await act(async () => store.openEmailLink({ kind: "reset", link: "used-link" }));
    const dialog = screen.getByRole("dialog", { name: "Set a new password" });
    type(dialog, "New password", "long enough");
    type(dialog, "New password again", "long enough");
    fireEvent.click(within(dialog).getByRole("button", { name: "Set password" }));
    expect(await screen.findByRole("dialog", { name: "This link no longer works" })).toBeDefined();
    expect(readSession()).toBeNull();
  });
});
