import { useState } from "react";
import { requestGeneratedName } from "../../api/requestGeneratedName";
import type { LobbyFlow } from "./LobbyFlow";
import type { LobbyIntent } from "./LobbyIntent";

export function useLobbyFlow(
  isLoggedIn: boolean,
  onJoin: (code: string) => void,
  onStartTutorial: (() => void) | null,
): LobbyFlow {
  const [guestPrompt, setGuestPrompt] = useState<LobbyFlow["guestPrompt"]>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  function proceed(intent: LobbyIntent): void {
    switch (intent.kind) {
      case "join":
        onJoin(intent.code);
        return;
      case "create":
        setIsCreateOpen(true);
        return;
      case "tutorial":
        onStartTutorial?.();
        return;
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
