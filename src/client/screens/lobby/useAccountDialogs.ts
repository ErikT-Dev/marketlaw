import { useState } from "react";
import { requestGeneratedName } from "../../api/requestGeneratedName";
import type { AccountDialog } from "./AccountDialog";
import type { AccountDialogs } from "./AccountDialogs";

export function useAccountDialogs(): AccountDialogs {
  const [dialog, setDialog] = useState<AccountDialog | null>(null);
  return {
    dialog,
    openLogIn: () => {
      setDialog({ kind: "log_in" });
    },
    openSignUp: async () => {
      setDialog(null);
      setDialog({ kind: "sign_up", prefilledName: await requestGeneratedName() });
    },
    close: () => {
      setDialog(null);
    },
  };
}
