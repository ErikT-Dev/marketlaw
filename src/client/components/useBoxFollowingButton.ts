import { useEffect, type RefObject } from "react";

export function useBoxFollowingButton(
  isOpen: boolean,
  buttonRef: RefObject<HTMLButtonElement | null>,
  placeBelow: (button: HTMLButtonElement) => void,
) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    function followButton() {
      const button = buttonRef.current;
      if (button !== null) {
        placeBelow(button);
      }
    }
    window.addEventListener("scroll", followButton, true);
    window.addEventListener("resize", followButton);
    return () => {
      window.removeEventListener("scroll", followButton, true);
      window.removeEventListener("resize", followButton);
    };
  }, [isOpen, buttonRef, placeBelow]);
}
