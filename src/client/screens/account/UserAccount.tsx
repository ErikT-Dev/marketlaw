import { useState } from "react";
import { SignUpDialog } from "../lobby/SignUpDialog";
import type { AccountBinding } from "./AccountBinding";
import { AccountSettingsDialog } from "./AccountSettingsDialog";
import { GuestLogOutWarning } from "./GuestLogOutWarning";
import type { UserAccountDialog } from "./UserAccountDialog";
import { UserMenu } from "./UserMenu";

type Props = {
  readonly account: AccountBinding;
};

export function UserAccount({ account }: Props) {
  const [dialog, setDialog] = useState<UserAccountDialog | null>(null);
  function close() {
    setDialog(null);
  }
  function openSignUp() {
    setDialog("sign_up");
  }
  function logOut() {
    if (account.isGuest) {
      setDialog("guest_log_out_warning");
    } else {
      void account.onLogOut();
    }
  }
  return (
    <>
      <UserMenu
        name={account.name}
        isGuest={account.isGuest}
        onSignUp={openSignUp}
        onOpenSettings={() => {
          setDialog("settings");
        }}
        onLogOut={logOut}
      />
      {dialog === "settings" ? (
        <AccountSettingsDialog
          account={account}
          onSignUp={openSignUp}
          onLogOut={logOut}
          onClose={close}
        />
      ) : null}
      {dialog === "guest_log_out_warning" ? (
        <GuestLogOutWarning onSignUp={openSignUp} onLogOut={account.onLogOut} onCancel={close} />
      ) : null}
      {dialog === "sign_up" ? (
        <SignUpDialog
          prefilledName={account.name}
          isGuest={account.isGuest}
          onSubmit={async (signup) => {
            const problem = await account.onSignUp(signup);
            if (problem === null) {
              close();
            }
            return problem;
          }}
          onCancel={close}
        />
      ) : null}
    </>
  );
}
