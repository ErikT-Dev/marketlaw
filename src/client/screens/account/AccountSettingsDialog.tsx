import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import styles from "./Account.module.css";
import type { AccountBinding } from "./AccountBinding";
import { EmailSetting } from "./EmailSetting";
import type { UserAccountDialog } from "./UserAccountDialog";
import { UsernameSetting } from "./UsernameSetting";
import { useAccountDetails } from "./useAccountDetails";

type Props = {
  readonly account: AccountBinding;
  readonly onSignUp: () => void;
  readonly onOpenDialog: (dialog: UserAccountDialog) => void;
  readonly onLogOut: () => void;
  readonly onClose: () => void;
};

export function AccountSettingsDialog(props: Props) {
  const { account, onSignUp, onOpenDialog, onLogOut, onClose } = props;
  const { details, reload } = useAccountDetails(account.onLoadAccount);
  const email = details?.email ?? null;
  return (
    <Modal title="Account settings" size="large" onClose={onClose}>
      <UsernameSetting
        name={account.name}
        wait={details?.usernameWait ?? null}
        onChangeUsername={account.onChangeUsername}
        onChanged={reload}
      />
      {email === null || account.isGuest ? null : (
        <EmailSetting
          email={email}
          onChangeEmail={() => {
            onOpenDialog(email.address === null ? "add_email" : "change_email");
          }}
          onSendAgain={account.onSendConfirmationAgain}
        />
      )}
      {account.isGuest ? (
        <section className={styles["guestNote"]} aria-labelledby="guest-note-heading">
          <h3 id="guest-note-heading" className={styles["guestNoteTitle"]}>
            You are playing as a guest
          </h3>
          <p className={styles["guestNoteText"]}>
            Your account only works in this browser. Sign up to keep your games and rating and log
            in from anywhere.
          </p>
          <div>
            <Button look="primary" onClick={onSignUp}>
              Sign up
            </Button>
          </div>
        </section>
      ) : null}
      <div className={styles["settingsButtons"]}>
        <div className={styles["settingButtons"]}>
          <Button look="secondary" onClick={onLogOut}>
            Log out
          </Button>
          {account.isGuest ? null : (
            <Button
              look="danger"
              onClick={() => {
                onOpenDialog("delete_account");
              }}
            >
              Delete account
            </Button>
          )}
        </div>
        <Button look="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
