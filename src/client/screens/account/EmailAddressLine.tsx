import styles from "./Account.module.css";

type Props = {
  readonly address: string;
  readonly isConfirmed: boolean;
};

export function EmailAddressLine({ address, isConfirmed }: Props) {
  return (
    <div>
      <p className={styles["emailAddress"]}>
        {address}{" "}
        <span className={styles[isConfirmed ? "emailConfirmed" : "emailUnconfirmed"]}>
          {isConfirmed ? "✓ confirmed" : "not confirmed"}
        </span>
      </p>
      <p className={styles["emailHint"]}>
        {isConfirmed
          ? "Used only to confirm it and for password resets."
          : "Open the link we sent to confirm it. Until then you cannot reset your password or join the ranked queue."}
      </p>
    </div>
  );
}
