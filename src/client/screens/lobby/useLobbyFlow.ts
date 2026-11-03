import { useState } from "react";
import { requestGeneratedName } from "../../api/requestGeneratedName";
import type { LobbyFlow } from "./LobbyFlow";
import type { LobbyIntent } from "./LobbyIntent";

export function useLobbyFlow(isLoggedIn: boolean, onJoin: (code: string) => void): LobbyFlow {
  const [guestPrompt, setGuestPrompt] = useState<LobbyFlow["guestPrompt"]>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  function proceed(intent: LobbyIntent): void {
    if (intent.kind === "join") {
      onJoin(intent.code);
    } else {
      setIsCreateOpen(true);
    }
  }
  return {
    guestPrompt,
    isCreateOpen,
    start: async (intent) => {
      if (isLoggedIn) {
        proceed(intent);
        return;
      }
      setGuestPrompt({ generatedName: await requestGeneratedName(), then: intent });
    },
    continueAfterGuest: () => {
      const then = guestPrompt?.then;
      setGuestPrompt(null);
      if (then !== undefined) {
        proceed(then);
      }
    },
    closeDialogs: () => {
      setGuestPrompt(null);
      setIsCreateOpen(false);
    },
  };
}
