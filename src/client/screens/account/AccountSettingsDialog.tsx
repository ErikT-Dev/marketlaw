import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { PrivacyNoticeLink } from "../privacy/PrivacyNoticeLink";
import styles from "./Account.module.css";
import type { AccountBinding } from "./AccountBinding";
import { EmailSetting } from "./EmailSetting";
import { GuestSignUpNote } from "./GuestSignUpNote";
import { IconSetting } from "./IconSetting";
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
      <IconSetting
        icon={details?.icon ?? null}
        wait={details?.iconWait ?? null}
        onChangeIcon={account.onChangeIcon}
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
      {account.isGuest ? <GuestSignUpNote onSignUp={onSignUp} /> : null}
      <PrivacyNoticeLink />
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
