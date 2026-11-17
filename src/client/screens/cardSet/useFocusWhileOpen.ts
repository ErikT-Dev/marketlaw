import { useEffect, useRef, type RefObject } from "react";

export function useFocusWhileOpen(): RefObject<HTMLDivElement | null> {
  const focusRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const focusedBefore = document.activeElement;
    focusRef.current?.focus();
    return () => {
      if (focusedBefore instanceof HTMLElement && focusedBefore.isConnected) {
        focusedBefore.focus();
      }
    };
  }, []);
  return focusRef;
}
