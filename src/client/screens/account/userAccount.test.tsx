import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import * as v from "valibot";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UsernameWait } from "../../../shared/api/UsernameWait";
import { testAccount } from "../../testing/testAccount";
import type { AccountBinding } from "./AccountBinding";
import { UserAccount } from "./UserAccount";

const OCTOBER_27 = Date.UTC(2026, 9, 27, 12);

function userAccount(changes: Partial<AccountBinding> = {}): AccountBinding {
  const account = testAccount(changes);
  render(<UserAccount account={account} rating={null} />);
  return account;
}

function openMenu(): HTMLElement {
  fireEvent.click(screen.getByRole("button", { name: "Your account" }));
  return screen.getByRole("list", { name: "User menu" });
}

function menuItem(name: string): HTMLElement {
  return within(openMenu()).getByRole("button", { name });
}

beforeEach(() => {
  Reflect.set(window, "turnstile", {
    render: (container: unknown, options: { readonly callback: (token: string) => void }) => {
      options.callback("passed");
      return "widget";
    },
    remove: () => undefined,
  });
  vi.stubGlobal("fetch", async () => Promise.resolve(Response.json({ siteKey: "key" })));
});

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window, "turnstile");
});

describe("the user menu", () => {
  it("offers a guest signing up first, then settings, match history and log out", () => {
    userAccount();
    expect(screen.getByRole("button", { name: "Your account" }).textContent).toBe("BBeaGuest");
    const items = within(openMenu()).getAllByRole("button");
    expect(items.map((item) => item.textContent)).toEqual([
      "Sign up to keep your account",
      "Account settings",
      "My match history",
      "Log out",
    ]);
    expect(items[2]).toHaveProperty("disabled", false);
  });

  it("opens the own match history from the menu, and only once the player id is known", () => {
    const account = testAccount();
    const { unmount } = render(<UserAccount account={account} rating={null} />);
    fireEvent.click(menuItem("My match history"));
    expect(window.location.hash).toBe(`#history/${String(account.playerId)}`);
    unmount();
    userAccount({ playerId: null });
    expect(menuItem("My match history")).toHaveProperty("disabled", true);
  });

  it("shows a registered user without the guest mark and without signing up", () => {
    userAccount({ isGuest: false });
    expect(screen.getByRole("button", { name: "Your account" }).textContent).toBe("BBea");
    expect(within(openMenu()).queryByRole("button", { name: /Sign up/ })).toBeNull();
  });

  it("closes the menu after a choice", () => {
    userAccount();
    fireEvent.click(menuItem("Account settings"));
    expect(screen.queryByRole("list", { name: "User menu" })).toBeNull();
    expect(screen.getByRole("dialog", { name: "Account settings" })).toBeDefined();
  });

  it("logs a registered user out at once", () => {
    const account = userAccount({ isGuest: false });
    fireEvent.click(menuItem("Log out"));
    expect(account.onLogOut).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("warns a guest before logging out and logs out only when asked", async () => {
    const account = userAccount();
    fireEvent.click(menuItem("Log out"));
    const warning = screen.getByRole("dialog", { name: "Log out of a guest account?" });
    expect(warning.textContent).toContain("you cannot log back in");
    expect(warning.textContent).toContain("logging out also leaves that game");
    expect(account.onLogOut).not.toHaveBeenCalled();
    fireEvent.click(within(warning).getByRole("button", { name: "Log out anyway" }));
    await waitFor(() => {
      expect(account.onLogOut).toHaveBeenCalledOnce();
    });
  });

  it("lets a guest sign up instead of logging out, with their username prefilled", () => {
    userAccount();
    fireEvent.click(menuItem("Log out"));
    fireEvent.click(screen.getByRole("button", { name: "Sign up instead" }));
    const signUp = screen.getByRole("dialog", { name: "Sign up" });
    expect(within(signUp).getByLabelText("Username")).toHaveProperty("value", "Bea");
    expect(signUp.textContent).toContain("including a game in progress");
  });
});

describe("account settings", () => {
  function openSettings(): HTMLElement {
    fireEvent.click(menuItem("Account settings"));
    return screen.getByRole("dialog", { name: "Account settings" });
  }

  it("says how often a username can be changed and changes it", async () => {
    const account = userAccount();
    const settings = openSettings();
    const field = within(settings).getByLabelText("Username");
    expect(settings.textContent).toContain("You can change it 4 times in 7 days.");
    expect(within(settings).getByRole("button", { name: "Change" })).toHaveProperty(
      "disabled",
      true,
    );
    fireEvent.change(field, { target: { value: " Bea City " } });
    fireEvent.click(within(settings).getByRole("button", { name: "Change" }));
    await waitFor(() => {
      expect(account.onChangeUsername).toHaveBeenCalledWith("Bea City");
    });
    expect(account.onLoadAccount).toHaveBeenCalledTimes(2);
  });

  it("shows why a username change was refused", async () => {
    userAccount({ onChangeUsername: async () => Promise.resolve("username_taken") });
    const settings = openSettings();
    fireEvent.change(within(settings).getByLabelText("Username"), { target: { value: "Cy" } });
    fireEvent.click(within(settings).getByRole("button", { name: "Change" }));
    expect(
      await within(settings).findByText("That username is taken. Choose another one."),
    ).toBeDefined();
  });

  it("disables the username with the next allowed date after 4 changes in 7 days", async () => {
    const usernameWait = v.parse(UsernameWait, { allowedAt: OCTOBER_27 });
    userAccount({
      onLoadAccount: async () =>
        Promise.resolve({
          isLoggedIn: true,
          name: "Bea",
          usernameWait,
          email: null,
          rating: null,
        }),
    });
    const settings = openSettings();
    expect(
      await within(settings).findByText(
        "You have changed it 4 times in 7 days. You can change it again on 27 October.",
      ),
    ).toBeDefined();
    expect(within(settings).getByLabelText("Username")).toHaveProperty("disabled", true);
  });

  it("offers a guest signing up and warns before logging out", () => {
    userAccount();
    const settings = openSettings();
    expect(settings.textContent).toContain("You are playing as a guest");
    fireEvent.click(within(settings).getByRole("button", { name: "Log out" }));
    expect(screen.getByRole("dialog", { name: "Log out of a guest account?" })).toBeDefined();
  });

  it("shows a registered user no guest note and logs them out at once", () => {
    const account = userAccount({ isGuest: false });
    const settings = openSettings();
    expect(settings.textContent).not.toContain("You are playing as a guest");
    fireEvent.click(within(settings).getByRole("button", { name: "Log out" }));
    expect(account.onLogOut).toHaveBeenCalledOnce();
  });
});
