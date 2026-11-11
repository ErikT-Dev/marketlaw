import { useCallback, useId, useRef, useState } from "react";
import { useHelpBoxDismissal } from "../../components/useHelpBoxDismissal";
import styles from "./Account.module.css";
import { UserMenuItems } from "./UserMenuItems";

type Props = {
  readonly name: string;
  readonly isGuest: boolean;
  readonly onOpenMatchHistory: (() => void) | null;
  readonly onSignUp: () => void;
  readonly onOpenSettings: () => void;
  readonly onLogOut: () => void;
};

export function UserMenu(props: Props) {
  const { name, isGuest, onSignUp, onOpenSettings, onOpenMatchHistory, onLogOut } = props;
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);
  useHelpBoxDismissal(isOpen, containerRef, close);
  function choose(action: () => void): () => void {
    return () => {
      close();
      action();
    };
  }
  return (
    <div ref={containerRef} className={styles["userMenuPlace"]}>
      <button
        type="button"
        className={styles["userBox"]}
        aria-label="Your account"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <span className={styles["avatar"]} aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className={styles["userText"]}>
          <strong className={styles["userName"]}>{name}</strong>
          {isGuest ? <span className={styles["guestMark"]}>Guest</span> : null}
        </span>
      </button>
      {isOpen ? (
        <UserMenuItems
          id={menuId}
          isGuest={isGuest}
          onSignUp={choose(onSignUp)}
          onOpenSettings={choose(onOpenSettings)}
          onOpenMatchHistory={onOpenMatchHistory === null ? null : choose(onOpenMatchHistory)}
          onLogOut={choose(onLogOut)}
        />
      ) : null}
    </div>
  );
}
