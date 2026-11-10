import { useSyncExternalStore } from "react";
import type { ClientStore } from "../../store/ClientStore";
import { CheckYourEmailDialog } from "./CheckYourEmailDialog";
import { EmailConfirmedDialog } from "./EmailConfirmedDialog";
import { ForgotPasswordDialog } from "./ForgotPasswordDialog";
import { LinkExpiredDialog } from "./LinkExpiredDialog";
import { NewPasswordDialog } from "./NewPasswordDialog";

type Props = {
  readonly store: ClientStore;
};

export function EmailDialogIfOpen({ store }: Props) {
  const dialog = useSyncExternalStore(store.subscribe, () => store.getSnapshot().emailDialog);
  const close = store.closeEmailDialog;
  if (dialog === null) {
    return null;
  }
  switch (dialog.kind) {
    case "check_email":
      return (
        <CheckYourEmailDialog
          address={dialog.address}
          onSendAgain={store.sendConfirmationAgain}
          onClose={close}
        />
      );
    case "email_confirmed":
      return <EmailConfirmedDialog onClose={close} />;
    case "new_password":
      return (
        <NewPasswordDialog
          key={dialog.link}
          link={dialog.link}
          onSubmit={store.setNewPassword}
          onClose={close}
        />
      );
    case "link_expired":
      return (
        <LinkExpiredDialog
          unconfirmedAddress={dialog.unconfirmedAddress}
          onSendAgain={store.sendConfirmationAfterExpiredLink}
          onForgotPassword={store.openForgotPassword}
          onClose={close}
        />
      );
    case "forgot_password":
      return <ForgotPasswordDialog onSend={store.requestPasswordReset} onClose={close} />;
  }
}
