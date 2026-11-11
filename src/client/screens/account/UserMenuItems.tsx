import styles from "./Account.module.css";

type Props = {
  readonly id: string;
  readonly isGuest: boolean;
  readonly onOpenMatchHistory: (() => void) | null;
  readonly onSignUp: () => void;
  readonly onOpenSettings: () => void;
  readonly onLogOut: () => void;
};

export function UserMenuItems(props: Props) {
  const { id, isGuest, onSignUp, onOpenSettings, onOpenMatchHistory, onLogOut } = props;
  return (
    <ul id={id} className={styles["userMenu"]} aria-label="User menu">
      {isGuest ? (
        <li>
          <button type="button" className={styles["signUpItem"]} onClick={onSignUp}>
            Sign up to keep your account
          </button>
        </li>
      ) : null}
      <li>
        <button type="button" className={styles["menuItem"]} onClick={onOpenSettings}>
          Account settings
        </button>
      </li>
      <li>
        <button
          type="button"
          className={styles["menuItem"]}
          disabled={onOpenMatchHistory === null}
          onClick={onOpenMatchHistory ?? undefined}
        >
          My match history
        </button>
      </li>
      <li>
        <button
          type="button"
          className={styles[isGuest ? "guestLogOutItem" : "menuItem"]}
          onClick={onLogOut}
        >
          Log out
        </button>
      </li>
    </ul>
  );
}
