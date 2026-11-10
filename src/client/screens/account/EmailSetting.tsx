import type { AccountEmail } from "../../../shared/api/AccountEmail";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { Button } from "../../components/Button";
import { EmailProblem } from "../email/EmailProblem";
import { useEmailRequest } from "../email/useEmailRequest";
import styles from "./Account.module.css";
import { EmailAddressLine } from "./EmailAddressLine";
import { EmailNote } from "./EmailNote";
import { pendingEmailText } from "./pendingEmailText";

type Props = {
  readonly email: AccountEmail;
  readonly onChangeEmail: () => void;
  readonly onSendAgain: () => Promise<ReasonCode | null>;
};

const REMOVED_TEXT =
  "Another account confirmed your address first, so it was removed from this account. Add a new address to reset your password and play ranked games.";

export function EmailSetting({ email, onChangeEmail, onSendAgain }: Props) {
  const sending = useEmailRequest();
  const { address, isConfirmed, pendingAddress } = email;
  const isUnconfirmed = address !== null && !isConfirmed;
  return (
    <section className={styles["setting"]} aria-labelledby="email-setting-heading">
      <h3 id="email-setting-heading" className={styles["settingTitle"]}>
        Email address
      </h3>
      {address === null ? null : <EmailAddressLine address={address} isConfirmed={isConfirmed} />}
      {email.wasRemoved ? (
        <EmailNote tone="removed" title="Your email address was removed" text={REMOVED_TEXT} />
      ) : null}
      {pendingAddress === null ? null : (
        <EmailNote tone="pending" title={null} text={pendingEmailText(email, pendingAddress)} />
      )}
      {sending.isDone ? (
        <p role="status" className={styles["emailHint"]}>
          We sent the link again.
        </p>
      ) : null}
      <EmailProblem problem={sending.problem} />
      <div className={styles["settingButtons"]}>
        <Button look={address === null ? "primary" : "secondary"} onClick={onChangeEmail}>
          {address === null ? "Add an email address" : "Change email address"}
        </Button>
        {isUnconfirmed ? (
          <Button
            look="secondary"
            loadingLabel={sending.isSending ? "Sending" : null}
            onClick={() => void sending.send(onSendAgain)}
          >
            Send it again
          </Button>
        ) : null}
      </div>
    </section>
  );
}
