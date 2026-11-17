import * as v from "valibot";
import { vi } from "vitest";
import { PlayerId } from "../../shared/PlayerId";
import type { AccountBinding } from "../screens/account/AccountBinding";

export function testAccount(changes: Partial<AccountBinding> = {}): AccountBinding {
  return {
    playerId: v.parse(PlayerId, "5b0f6a52-3d5e-4f7c-8a41-6c2b9e0d7f13"),
    name: "Bea",
    isGuest: true,
    isInGame: false,
    onSignUp: vi.fn(async () => Promise.resolve(null)),
    onChangeUsername: vi.fn(async () => Promise.resolve(null)),
    onLoadAccount: vi.fn(async () =>
      Promise.resolve({
        isLoggedIn: true as const,
        name: "Bea",
        usernameWait: null,
        email: null,
        rating: null,
      }),
    ),
    onChangeEmail: vi.fn(async () => Promise.resolve(null)),
    onSendConfirmationAgain: vi.fn(async () => Promise.resolve(null)),
    onDeleteAccount: vi.fn(async () => Promise.resolve(null)),
    onLogOut: vi.fn(async () => Promise.resolve()),
    ...changes,
  };
}
