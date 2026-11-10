import { Button } from "../../components/Button";
import styles from "./Account.module.css";

type Props = {
  readonly onSignUp: () => void;
};

export function GuestSignUpNote({ onSignUp }: Props) {
  return (
    <section className={styles["guestNote"]} aria-labelledby="guest-note-heading">
      <h3 id="guest-note-heading" className={styles["guestNoteTitle"]}>
        You are playing as a guest
      </h3>
      <p className={styles["guestNoteText"]}>
        Your account only works in this browser. Sign up to keep your games and rating and log in
        from anywhere.
      </p>
      <div>
        <Button look="primary" onClick={onSignUp}>
          Sign up
        </Button>
      </div>
    </section>
  );
}
