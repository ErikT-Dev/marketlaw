import { useCallback, useEffect, useState } from "react";
import type { AccountResponse } from "../../../shared/api/AccountResponse";
import type { LoggedInAccount } from "./LoggedInAccount";

export function useAccountDetails(loadAccount: () => Promise<AccountResponse | null>) {
  const [details, setDetails] = useState<LoggedInAccount | null>(null);
  const reload = useCallback(async () => {
    const account = await loadAccount();
    setDetails(account?.isLoggedIn === true ? account : null);
  }, [loadAccount]);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { details, reload };
}
