import { useEffect, useRef, useState, type RefObject } from "react";
import { requestHumanCheckKey } from "../../api/requestHumanCheckKey";
import { loadTurnstile } from "./loadTurnstile";
import type { TurnstileApi } from "./TURNSTILE_API";

export type HumanCheckState = {
  readonly containerRef: RefObject<HTMLDivElement | null>;
  readonly token: string;
  readonly isUnavailable: boolean;
};

export function useHumanCheck(attempt: number): HumanCheckState {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [token, setToken] = useState("");
  const [isUnavailable, setIsUnavailable] = useState(false);
  useEffect(() => {
    const stopped = new AbortController();
    let widget: { readonly api: TurnstileApi; readonly id: unknown } | null = null;
    setToken("");
    void (async () => {
      const [siteKey, turnstile] = await Promise.all([requestHumanCheckKey(), loadTurnstile()]);
      const container = containerRef.current;
      if (stopped.signal.aborted || container === null) {
        return;
      }
      if (siteKey === null || turnstile === null) {
        setIsUnavailable(true);
        return;
      }
      const id = turnstile.render(container, {
        sitekey: siteKey,
        callback: (passed: unknown) => {
          setToken(typeof passed === "string" ? passed : "");
        },
        "expired-callback": () => {
          setToken("");
        },
      });
      widget = { api: turnstile, id };
    })();
    return () => {
      stopped.abort();
      widget?.api.remove(widget.id);
    };
  }, [attempt]);
  return { containerRef, token, isUnavailable };
}
