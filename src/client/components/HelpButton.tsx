import { useCallback, useId, useRef, useState } from "react";
import styles from "./HelpButton.module.css";
import { HelpText } from "./HelpText";
import type { HelpTextPart } from "./HelpTextPart";
import { useBoxFollowingButton } from "./useBoxFollowingButton";
import { useHelpBoxDismissal } from "./useHelpBoxDismissal";

type Props = {
  readonly name: string;
  readonly text: ReadonlyArray<HelpTextPart>;
};

type BoxPosition = { readonly top: number; readonly left: number };

const BOX_WIDTH_PX = 340;
const BOX_GAP_PX = 6;
const WINDOW_MARGIN_PX = 16;

function boxPositionBelow(button: HTMLElement): BoxPosition {
  const box = button.getBoundingClientRect();
  return {
    top: box.bottom + BOX_GAP_PX,
    left: Math.max(
      WINDOW_MARGIN_PX,
      Math.min(box.left, window.innerWidth - BOX_WIDTH_PX - WINDOW_MARGIN_PX),
    ),
  };
}

export function HelpButton({ name, text }: Props) {
  const boxId = useId();
  const containerRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<BoxPosition | null>(null);
  const isOpen = position !== null;
  const close = useCallback(() => {
    setPosition(null);
  }, []);
  const placeBelow = useCallback((button: HTMLButtonElement) => {
    setPosition(boxPositionBelow(button));
  }, []);
  useHelpBoxDismissal(isOpen, containerRef, close);
  useBoxFollowingButton(isOpen, buttonRef, placeBelow);
  return (
    <span ref={containerRef} className={styles["container"]}>
      <button
        ref={buttonRef}
        type="button"
        className={styles["button"]}
        aria-label={name}
        aria-expanded={isOpen}
        aria-controls={boxId}
        onClick={(event) => {
          if (isOpen) {
            close();
          } else {
            placeBelow(event.currentTarget);
          }
        }}
      >
        ?
      </button>
      {position === null ? null : (
        <section
          id={boxId}
          className={styles["box"]}
          aria-label={name}
          style={{ top: position.top, left: position.left, width: BOX_WIDTH_PX }}
        >
          <HelpText parts={text} />
        </section>
      )}
    </span>
  );
}
