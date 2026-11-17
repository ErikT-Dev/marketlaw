import { useEffect, useState } from "react";
import type { PlayerId } from "../../../shared/PlayerId";
import type { AccountBinding } from "./AccountBinding";
import type { LoggedInAccount } from "./LoggedInAccount";

type LoadedDetails = {
  readonly playerId: PlayerId | null;
  readonly details: LoggedInAccount;
};

export function useRegisteredAccountDetails(
  account: AccountBinding | null,
  check: string,
): LoggedInAccount | null {
  const [loaded, setLoaded] = useState<LoadedDetails | null>(null);
  const isRegistered = account !== null && !account.isGuest;
  const loadAccount = account?.onLoadAccount ?? null;
  const playerId = account?.playerId ?? null;
  useEffect(() => {
    if (!isRegistered || loadAccount === null) {
      return undefined;
    }
    let isCurrent = true;
    async function loadDetails(load: NonNullable<typeof loadAccount>) {
      const details = await load();
      if (isCurrent && details?.isLoggedIn === true) {
        setLoaded({ playerId, details });
      }
    }
    void loadDetails(loadAccount);
    return () => {
      isCurrent = false;
    };
  }, [isRegistered, loadAccount, playerId, check]);
  return isRegistered && loaded?.playerId === playerId ? loaded.details : null;
}
