import styles from "./Account.module.css";

type Props = {
  readonly id: string;
  readonly isGuest: boolean;
  readonly onSignUp: () => void;
  readonly onOpenSettings: () => void;
  readonly onLogOut: () => void;
};

export function UserMenuItems({ id, isGuest, onSignUp, onOpenSettings, onLogOut }: Props) {
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
        <button type="button" className={styles["menuItem"]} disabled>
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
