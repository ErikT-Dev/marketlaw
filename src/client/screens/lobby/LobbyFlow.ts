import type { LobbyIntent } from "./LobbyIntent";

export type LobbyFlow = {
  readonly guestPrompt: { readonly generatedName: string; readonly then: LobbyIntent } | null;
  readonly isCreateOpen: boolean;
  readonly start: (intent: LobbyIntent) => Promise<void>;
  readonly continueAfterGuest: () => void;
  readonly closeDialogs: () => void;
};
