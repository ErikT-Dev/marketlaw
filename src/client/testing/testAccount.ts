import { vi } from "vitest";
import type { AccountBinding } from "../screens/account/AccountBinding";

export function testAccount(changes: Partial<AccountBinding> = {}): AccountBinding {
  return {
    name: "Bea",
    isGuest: true,
    isInGame: false,
    onSignUp: vi.fn(async () => Promise.resolve(null)),
    onChangeUsername: vi.fn(async () => Promise.resolve(null)),
    onLoadAccount: vi.fn(async () =>
      Promise.resolve({ isLoggedIn: true as const, name: "Bea", usernameWait: null, email: null }),
    ),
    onChangeEmail: vi.fn(async () => Promise.resolve(null)),
    onSendConfirmationAgain: vi.fn(async () => Promise.resolve(null)),
    onDeleteAccount: vi.fn(async () => Promise.resolve(null)),
    onLogOut: vi.fn(async () => Promise.resolve()),
    ...changes,
  };
}
