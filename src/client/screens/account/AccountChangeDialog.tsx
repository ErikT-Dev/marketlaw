import type { AccountBinding } from "./AccountBinding";
import { ChangeEmailDialog } from "./ChangeEmailDialog";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import type { UserAccountDialog } from "./UserAccountDialog";

type Props = {
  readonly dialog: UserAccountDialog | null;
  readonly account: AccountBinding;
  readonly onBack: () => void;
};

export function AccountChangeDialog({ dialog, account, onBack }: Props) {
  if (dialog === "change_email" || dialog === "add_email") {
    return (
      <ChangeEmailDialog
        isAdding={dialog === "add_email"}
        onSend={account.onChangeEmail}
        onSent={onBack}
        onClose={onBack}
      />
    );
  }
  if (dialog === "delete_account") {
    return (
      <DeleteAccountDialog
        isInGame={account.isInGame}
        onDelete={account.onDeleteAccount}
        onCancel={onBack}
      />
    );
  }
  return null;
}
