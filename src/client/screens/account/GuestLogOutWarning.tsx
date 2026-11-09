import { useState } from "react";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import styles from "./Account.module.css";

type Props = {
  readonly onSignUp: () => void;
  readonly onLogOut: () => Promise<void>;
  readonly onCancel: () => void;
};

export function GuestLogOutWarning({ onSignUp, onLogOut, onCancel }: Props) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  async function logOut() {
    setIsLoggingOut(true);
    await onLogOut();
    setIsLoggingOut(false);
  }
  return (
    <Modal title="Log out of a guest account?" size="large" onClose={onCancel}>
      <p className={styles["warningText"]}>
        Guest accounts have no password, so you cannot log back in. Your username and games will be
        lost to you.
      </p>
      <p className={styles["warningDetail"]}>
        If you are in a game, logging out also leaves that game. Sign up instead to keep your
        account.
      </p>
      <div className={styles["warningButtons"]}>
        <Button look="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button look="primary" onClick={onSignUp}>
          Sign up instead
        </Button>
        <Button
          look="danger"
          loadingLabel={isLoggingOut ? "Logging out" : null}
          onClick={() => void logOut()}
        >
          Log out anyway
        </Button>
      </div>
    </Modal>
  );
}
