import { useEffect, useState } from "react";
import type { AccountBinding } from "../account/AccountBinding";
import type { RankedStanding } from "./RankedStanding";

export function useRankedStanding(account: AccountBinding | null, check: string): RankedStanding {
  const [isConfirmed, setIsConfirmed] = useState<boolean | null>(null);
  const isRegistered = account !== null && !account.isGuest;
  const loadAccount = account?.onLoadAccount ?? null;
  const playerId = account?.playerId ?? null;
  useEffect(() => {
    if (!isRegistered || loadAccount === null) {
      return undefined;
    }
    let isCurrent = true;
    async function loadStanding(load: NonNullable<typeof loadAccount>) {
      const details = await load();
      if (isCurrent && details?.isLoggedIn === true) {
        setIsConfirmed(details.email?.isConfirmed === true);
      }
    }
    void loadStanding(loadAccount);
    return () => {
      isCurrent = false;
    };
  }, [isRegistered, loadAccount, playerId, check]);
  if (account === null) {
    return "logged_out";
  }
  if (account.isGuest) {
    return "guest";
  }
  if (isConfirmed === null) {
    return "checking";
  }
  return isConfirmed ? "email_confirmed" : "email_not_confirmed";
}
