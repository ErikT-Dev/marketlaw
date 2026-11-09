import { useCallback, useEffect, useState } from "react";
import type { AccountResponse } from "../../../shared/api/AccountResponse";
import type { UsernameWait } from "../../../shared/api/UsernameWait";

export function useUsernameWait(loadAccount: () => Promise<AccountResponse | null>) {
  const [wait, setWait] = useState<UsernameWait | null>(null);
  const reload = useCallback(async () => {
    const account = await loadAccount();
    setWait(account?.isLoggedIn === true ? account.usernameWait : null);
  }, [loadAccount]);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { wait, reload };
}
