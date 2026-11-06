import { useEffect, type RefObject } from "react";

export function useHelpBoxDismissal(
  isOpen: boolean,
  containerRef: RefObject<HTMLElement | null>,
  close: () => void,
) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }
    function closeOnPointerElsewhere(event: PointerEvent) {
      const container = containerRef.current;
      if (container !== null && event.target instanceof Node && !container.contains(event.target)) {
        close();
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnPointerElsewhere);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnPointerElsewhere);
    };
  }, [isOpen, containerRef, close]);
}
