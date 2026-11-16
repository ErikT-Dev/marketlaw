import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { testRankedQueue } from "../../testing/testRankedQueue";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { LobbyPage } from "./LobbyPage";

type Answers = {
  readonly logIn?: ReadonlyArray<ReasonCode | null>;
  readonly signUp?: ReadonlyArray<ReasonCode | null>;
};

function lobbyLoggedOut(answers: Answers = {}) {
  const logIns = answers.logIn ?? [null];
  const signUps = answers.signUp ?? [null];
  const onLogIn = vi.fn(async () => Promise.resolve(logIns[onLogIn.mock.calls.length - 1] ?? null));
  const onSignUp = vi.fn(async () =>
    Promise.resolve(signUps[onSignUp.mock.calls.length - 1] ?? null),
  );
  const onForgotPassword = vi.fn();
  render(
    <LobbyPage
      account={null}
      joinError={null}
      removal={null}
      onJoin={vi.fn()}
      onCreate={async () => Promise.resolve(null)}
      onStartAsGuest={async () => Promise.resolve(null)}
      onLogIn={onLogIn}
      onSignUp={onSignUp}
      onForgotPassword={onForgotPassword}
      onDismissRemoval={vi.fn()}
      publicRooms={[]}
      ranked={testRankedQueue()}
    />,
  );
  return { onLogIn, onSignUp, onForgotPassword };
}

function type(container: HTMLElement, label: string, value: string): void {
  fireEvent.change(within(container).getByLabelText(label), { target: { value } });
}

async function openLogIn(): Promise<HTMLElement> {
  fireEvent.click(screen.getByRole("button", { name: "Log in" }));
  const dialog = await screen.findByRole("dialog", { name: "Log in" });
  type(dialog, "Username or email", " Bea ");
  type(dialog, "Password", "long enough");
  return dialog;
}

beforeEach(() => {
  Reflect.set(window, "turnstile", {
    render: (container: unknown, options: { readonly callback: (token: string) => void }) => {
      options.callback("passed");
      return "widget";
    },
    remove: () => undefined,
  });
  vi.stubGlobal("fetch", async (path: string) =>
    Promise.resolve(
      Response.json(
        path === "/api/human-check" ? { siteKey: "key" } : { name: "Quiet River Baron" },
      ),
    ),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window, "turnstile");
});

describe("log in and sign up", () => {
  it("offers log in and sign up instead of the user box when not logged in", () => {
    lobbyLoggedOut();
    expect(screen.getByRole("button", { name: "Log in" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign up" })).toBeDefined();
    expect(screen.queryByLabelText("Your account")).toBeNull();
  });

  it("logs in with username or email and password and closes on success", async () => {
    const { onLogIn } = lobbyLoggedOut();
    const dialog = await openLogIn();
    expect(within(dialog).queryByRole("group", { name: "Human check" })).toBeNull();
    fireEvent.click(within(dialog).getByRole("button", { name: "Log in" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Log in" })).toBeNull();
    });
    expect(onLogIn).toHaveBeenCalledWith({ login: "Bea", password: "long enough" });
  });

  it("says only that the login failed", async () => {
    lobbyLoggedOut({ logIn: ["login_failed"] });
    const dialog = await openLogIn();
    fireEvent.click(within(dialog).getByRole("button", { name: "Log in" }));
    expect(await within(dialog).findByText("Wrong username, email or password.")).toBeDefined();
  });

  it("shows the human check and why after repeated failures, then sends it", async () => {
    const { onLogIn } = lobbyLoggedOut({ logIn: ["human_check_failed", null] });
    const dialog = await openLogIn();
    fireEvent.click(within(dialog).getByRole("button", { name: "Log in" }));
    expect(await within(dialog).findByRole("group", { name: "Human check" })).toBeDefined();
    expect(within(dialog).getByText(/The account is never locked\./)).toBeDefined();
    const logIn = within(dialog).getByRole("button", { name: "Log in" });
    await waitFor(() => {
      expect(logIn).toHaveProperty("disabled", false);
    });
    fireEvent.click(logIn);
    await waitFor(() => {
      expect(onLogIn).toHaveBeenLastCalledWith({
        login: "Bea",
        password: "long enough",
        humanCheck: "passed",
      });
    });
  });

  it("goes from log in to sign up with a generated username", async () => {
    lobbyLoggedOut();
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    const logIn = await screen.findByRole("dialog", { name: "Log in" });
    fireEvent.click(within(logIn).getByRole("button", { name: "No account yet? Sign up" }));
    const signUp = await screen.findByRole("dialog", { name: "Sign up" });
    expect(within(signUp).getByLabelText("Username")).toHaveProperty("value", "Quiet River Baron");
    expect(screen.queryByRole("dialog", { name: "Log in" })).toBeNull();
  });

  it("goes from log in to the forgotten password form", async () => {
    const { onForgotPassword } = lobbyLoggedOut();
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    const logIn = await screen.findByRole("dialog", { name: "Log in" });
    fireEvent.click(within(logIn).getByRole("button", { name: "Forgot your password?" }));
    expect(onForgotPassword).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog", { name: "Log in" })).toBeNull();
  });

  it("signs up with username, email, password and the human check", async () => {
    const { onSignUp } = lobbyLoggedOut({ signUp: ["email_invalid", null] });
    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));
    const dialog = await screen.findByRole("dialog", { name: "Sign up" });
    type(dialog, "Email address", "bea");
    type(dialog, "Password", "long enough");
    const signUp = within(dialog).getByRole("button", { name: "Sign up" });
    await waitFor(() => {
      expect(signUp).toHaveProperty("disabled", false);
    });
    fireEvent.click(signUp);
    expect(
      await within(dialog).findByText("Enter a whole email address, such as name@example.com."),
    ).toBeDefined();
    expect(onSignUp).toHaveBeenCalledWith({
      username: "Quiet River Baron",
      email: "bea",
      password: "long enough",
      humanCheck: "passed",
    });
  });
});
