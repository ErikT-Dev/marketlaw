import { useEffect, useState } from "react";
import { requestPrivacyContact } from "../../api/requestPrivacyContact";
import type { PrivacyContact } from "./PrivacyContact";

export function usePrivacyContact(): PrivacyContact {
  const [contact, setContact] = useState<PrivacyContact>({ kind: "loading" });
  useEffect(() => {
    const stopped = new AbortController();
    void (async () => {
      const address = await requestPrivacyContact();
      if (!stopped.signal.aborted) {
        setContact(address === null ? { kind: "unknown" } : { kind: "known", address });
      }
    })();
    return () => {
      stopped.abort();
    };
  }, []);
  return contact;
}
