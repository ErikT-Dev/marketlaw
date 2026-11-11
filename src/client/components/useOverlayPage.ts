import { useEffect, useRef, type RefObject } from "react";
import { goBack } from "./goBack";

function goBackOnEscape(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    event.stopPropagation();
    goBack();
  }
}

export function useOverlayPage(): RefObject<HTMLDivElement | null> {
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    pageRef.current?.focus();
    document.addEventListener("keydown", goBackOnEscape, { capture: true });
    return () => {
      document.removeEventListener("keydown", goBackOnEscape, { capture: true });
    };
  }, []);
  return pageRef;
}
