import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameHost } from "../../../shared/GameHost";
import { App } from "../../App";
import { ClientStore } from "../../store/ClientStore";
import { readSession } from "../../store/readSession";
import { writeSession } from "../../store/writeSession";
import { testAccount } from "../../testing/testAccount";
import { UserAccount } from "./UserAccount";

type SentRequest = { readonly path: string; readonly body: unknown };
type Answer = { readonly status: number; readonly body: unknown };
type Answers = Readonly<Record<string, ReadonlyArray<Answer>>>;
type EmailDetails = {
  readonly address: string | null;
  readonly isConfirmed: boolean;
  readonly pendingAddress: string | null;
  readonly wasRemoved: boolean;
};

const OK = { status: 200, body: { isOk: true } };
const CONFIRMED = {
  address: "bea@example.com",
  isConfirmed: true,
  pendingAddress: null,
  wasRemoved: false,
};

function accountAnswer(email: EmailDetails): Answer {
  return {
    status: 200,
    body: { isLoggedIn: true, name: "Bea", usernameWait: null, email, rating: null },
  };
}

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
    const list = answers[path] ?? [];
    const answer = list[Math.min(earlier, list.length - 1)] ?? { status: 200, body: {} };
    return Promise.resolve(
      typeof answer.body === "string"
        ? new Response(answer.body, { status: answer.status })
        : Response.json(answer.body, { status: answer.status }),
    );
  });
  return sent;
}

async function openSettingsAsBea(): Promise<HTMLElement> {
  writeSession({ token: "bea-token", playerId: null, name: "Bea", isGuest: false, roomCode: null });
  render(<App store={new ClientStore(() => idleHost())} />);
  fireEvent.click(await screen.findByRole("button", { name: "Your account" }));
  fireEvent.click(screen.getByRole("button", { name: "Account settings" }));
  return screen.getByRole("dialog", { name: "Account settings" });
}

function typeInto(container: HTMLElement, label: string, value: string): void {
  fireEvent.change(within(container).getByLabelText(label), { target: { value } });
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

describe("the email address in account settings", () => {
  it("changes the address with the human check and shows the pending change", async () => {
    const pending = { ...CONFIRMED, pendingAddress: "bea@example.org" };
    const sent = serverAnswers({
      "/api/account": [accountAnswer(CONFIRMED), accountAnswer(pending)],
      "/api/email-changes": [OK],
    });
    const settings = await openSettingsAsBea();
    expect(await within(settings).findByText("bea@example.com")).toBeDefined();
    expect(settings.textContent).toContain("✓ confirmed");
    fireEvent.click(within(settings).getByRole("button", { name: "Change email address" }));
    const change = screen.getByRole("dialog", { name: "Change email address" });
    typeInto(change, "New email address", " bea@example.org ");
    fireEvent.click(await within(change).findByRole("button", { name: "Send link" }));
    const reopened = await screen.findByRole("dialog", { name: "Account settings" });
    expect(
      await within(reopened).findByText(/Waiting for confirmation: bea@example.org\./),
    ).toBeDefined();
    expect(sent).toContainEqual({
      path: "/api/email-changes",
      body: { email: "bea@example.org", humanCheck: "passed", token: "bea-token" },
    });
  });

  it("shows why a change was refused and keeps the dialog open", async () => {
    serverAnswers({
      "/api/account": [accountAnswer(CONFIRMED)],
      "/api/email-changes": [{ status: 429, body: { isOk: false, reason: "email_limit_reached" } }],
    });
    const settings = await openSettingsAsBea();
    fireEvent.click(await within(settings).findByRole("button", { name: "Change email address" }));
    const change = screen.getByRole("dialog", { name: "Change email address" });
    typeInto(change, "New email address", "bea@example.org");
    await waitFor(() => {
      expect(within(change).getByRole("button", { name: "Send link" })).toHaveProperty(
        "disabled",
        false,
      );
    });
    fireEvent.click(within(change).getByRole("button", { name: "Send link" }));
    expect(await within(change).findByText(/No more emails can be sent/)).toBeDefined();
  });

  it("sends the confirmation again for an unconfirmed address", async () => {
    const sent = serverAnswers({
      "/api/account": [accountAnswer({ ...CONFIRMED, isConfirmed: false })],
      "/api/confirmation-emails": [OK],
    });
    const settings = await openSettingsAsBea();
    expect(await within(settings).findByText("not confirmed")).toBeDefined();
    fireEvent.click(within(settings).getByRole("button", { name: "Send it again" }));
    expect(await within(settings).findByText("We sent the link again.")).toBeDefined();
    expect(sent).toContainEqual({ path: "/api/confirmation-emails", body: { token: "bea-token" } });
  });

  it("explains a removed address and offers adding one", async () => {
    serverAnswers({
      "/api/account": [accountAnswer({ ...CONFIRMED, address: null, wasRemoved: true })],
    });
    const settings = await openSettingsAsBea();
    expect(await within(settings).findByText("Your email address was removed")).toBeDefined();
    expect(settings.textContent).toContain("Another account confirmed your address first");
    expect(within(settings).queryByRole("button", { name: "Send it again" })).toBeNull();
    fireEvent.click(within(settings).getByRole("button", { name: "Add an email address" }));
    expect(screen.getByRole("dialog", { name: "Add an email address" })).toBeDefined();
  });
});

describe("deleting an account", () => {
  it("refuses a wrong password and keeps the account", async () => {
    serverAnswers({
      "/api/account": [accountAnswer(CONFIRMED)],
      "/api/account-deletions": [{ status: 400, body: { isOk: false, reason: "password_wrong" } }],
    });
    const settings = await openSettingsAsBea();
    fireEvent.click(within(settings).getByRole("button", { name: "Delete account" }));
    const dialog = screen.getByRole("dialog", { name: "Delete your account?" });
    expect(dialog.textContent).toContain("This cannot be undone.");
    typeInto(dialog, "Password", "not mine");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete account" }));
    expect(await within(dialog).findByText("Wrong password.")).toBeDefined();
    expect(readSession()).not.toBeNull();
  });

  it("says when the server did not answer and keeps the account", async () => {
    serverAnswers({
      "/api/account": [accountAnswer(CONFIRMED)],
      "/api/account-deletions": [{ status: 503, body: "Could not delete the account" }],
    });
    const settings = await openSettingsAsBea();
    fireEvent.click(within(settings).getByRole("button", { name: "Delete account" }));
    const dialog = screen.getByRole("dialog", { name: "Delete your account?" });
    typeInto(dialog, "Password", "long enough");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete account" }));
    expect(await within(dialog).findByText("The server did not answer. Try again.")).toBeDefined();
    expect(readSession()).not.toBeNull();
  });

  it("deletes with the password and forgets the login", async () => {
    const sent = serverAnswers({
      "/api/account": [accountAnswer(CONFIRMED)],
      "/api/account-deletions": [OK],
    });
    const settings = await openSettingsAsBea();
    fireEvent.click(within(settings).getByRole("button", { name: "Delete account" }));
    const dialog = screen.getByRole("dialog", { name: "Delete your account?" });
    typeInto(dialog, "Password", "long enough");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete account" }));
    await waitFor(() => {
      expect(readSession()).toBeNull();
    });
    expect(sent).toContainEqual({
      path: "/api/account-deletions",
      body: { token: "bea-token", password: "long enough" },
    });
    expect(screen.queryByRole("button", { name: "Your account" })).toBeNull();
  });

  it("warns during a game that deleting counts as leaving it", () => {
    render(<UserAccount account={testAccount({ isGuest: false, isInGame: true })} rating={null} />);
    fireEvent.click(screen.getByRole("button", { name: "Your account" }));
    fireEvent.click(screen.getByRole("button", { name: "Account settings" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete account" }));
    const dialog = screen.getByRole("dialog", { name: "Delete your account during a game?" });
    expect(dialog.textContent).toContain("Deleting your account counts as leaving it");
    expect(within(dialog).getByRole("button", { name: "Leave the game and delete" })).toBeDefined();
  });

  it("offers a guest no account deleting", () => {
    render(<UserAccount account={testAccount()} rating={null} />);
    fireEvent.click(screen.getByRole("button", { name: "Your account" }));
    fireEvent.click(screen.getByRole("button", { name: "Account settings" }));
    expect(screen.queryByRole("button", { name: "Delete account" })).toBeNull();
  });
});
