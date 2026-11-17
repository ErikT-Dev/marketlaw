import { useCallback, useId, useRef, useState } from "react";
import buttonStyles from "../../components/Button.module.css";
import { useHelpBoxDismissal } from "../../components/useHelpBoxDismissal";
import styles from "./GameMenu.module.css";
import type { GameMenuEntry } from "./GameMenuEntry";
import { gameMenuEntriesOf } from "./gameMenuEntriesOf";
import { GameMenuList } from "./GameMenuList";
import type { GameMenuPlace } from "./GameMenuPlace";

type Props = {
  readonly place: GameMenuPlace;
  readonly buttonLabel: string;
};

export function GameMenu({ place, buttonLabel }: Props) {
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => {
    if (containerRef.current?.contains(document.activeElement) === true) {
      buttonRef.current?.focus();
    }
    setIsOpen(false);
  }, []);
  useHelpBoxDismissal(isOpen, containerRef, close);
  function choose(entry: GameMenuEntry) {
    setIsOpen(false);
    window.location.assign(entry.hash);
  }
  return (
    <div ref={containerRef} className={styles["place"]}>
      <button
        ref={buttonRef}
        type="button"
        className={`${buttonStyles["button"] ?? ""} ${buttonStyles["secondary"] ?? ""}`}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        {buttonLabel}
      </button>
      {isOpen ? (
        <GameMenuList id={menuId} entries={gameMenuEntriesOf(place)} onChoose={choose} />
      ) : null}
    </div>
  );
}
